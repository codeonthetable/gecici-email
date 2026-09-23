<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Parse Request Path
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Normalise path (strip /api/v1 or /api)
$path = preg_replace('#^/api/v1/#', '', $uri);
$path = preg_replace('#^/api/#', '', $path);
$path = trim($path, '/');

// 1. Instant Health Check (No DB required)
if ($path === 'health' || $path === '') {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'ok',
        'timestamp' => date('c'),
        'domain' => 'gecici.email',
        'allowedDomains' => ['gecici.email', 'localhost', '*']
    ]);
    exit;
}

// Data Directory
$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
    @file_put_contents($dataDir . '/.htaccess', "Deny from all\n");
}

$dbFile = $dataDir . '/gecici.sqlite';
$db = new PDO('sqlite:' . $dbFile, null, null, [
    PDO::ATTR_TIMEOUT => 3,
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
]);
$db->exec('PRAGMA journal_mode = WAL;');
$db->exec('PRAGMA busy_timeout = 3000;');
$db->exec('PRAGMA synchronous = NORMAL;');

// Initialize Tables
$db->exec("CREATE TABLE IF NOT EXISTS inboxes (
    address TEXT PRIMARY KEY,
    token TEXT,
    created_at INTEGER,
    expires_at INTEGER
)");

$db->exec("CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    inbox_address TEXT,
    message_id TEXT,
    from_name TEXT,
    from_address TEXT,
    subject TEXT,
    date_str TEXT,
    text_content TEXT,
    html_content TEXT,
    smart_summary TEXT,
    read_flag INTEGER DEFAULT 0,
    received_at INTEGER
)");

// Cleanup Expired (TTL) with 5% probability to avoid locking on every hit
if (rand(1, 20) === 1) {
    try {
        $nowMs = (int)(microtime(true) * 1000);
        $db->exec("DELETE FROM messages WHERE inbox_address IN (SELECT address FROM inboxes WHERE expires_at < $nowMs)");
        $db->exec("DELETE FROM inboxes WHERE expires_at < $nowMs");
    } catch (Exception $e) {}
}

function getJsonInput() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?: [];
}

function extractSmartSummary($subject, $text, $html, $fromAddress) {
    $combined = $subject . "\n" . $text;
    $otp = null;
    $otpContext = null;

    $keywords = [
        'onay kodunuz', 'onay kodu', 'doğrulama kodunuz', 'doğrulama kodu', 'güvenlik kodunuz', 'güvenlik kodu',
        'tek kullanımlık şifre', 'verification code is', 'verification code:', 'verification code',
        'security code is', 'security code:', 'security code', 'confirmation code', 'otp', 'passcode'
    ];

    foreach ($keywords as $kw) {
        $pattern = '/\b' . preg_quote($kw, '/') . '\b(?:\s*(?:is|are|:|\-|=|->)\s*)?([0-9]{3,4}-[0-9]{3,4}|[A-Z]{1,2}-[0-9]{4,6}|[0-9]{4,8})\b/i';
        if (preg_match($pattern, $combined, $m)) {
            $otp = trim($m[1]);
            $otpContext = trim($m[0]);
            break;
        }
    }

    if (!$otp && preg_match('/\b([0-9]{3,4}-[0-9]{3,4}|[0-9]{6}|[A-Z]{1,2}-[0-9]{4,6})\b/', $subject, $m)) {
        if (!preg_match('/^(19|20)\d{2}$/', $m[1])) {
            $otp = $m[1];
            $otpContext = "Subject: " . $subject;
        }
    }

    if (!$otp && preg_match('/\b([0-9]{6})\b/', $text, $m)) {
        if (!preg_match('/^(19|20)\d{2}$/', $m[1])) {
            $otp = $m[1];
            $otpContext = "Standard 6-digit match";
        }
    }

    // Action Link
    $link = null;
    $linkText = 'Doğrula / Onayla';
    if (preg_match_all('/<a\s+[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)<\/a>/is', $html, $matches, PREG_SET_ORDER)) {
        foreach ($matches as $match) {
            $href = $match[1];
            $anchor = strip_tags($match[2]);
            $lower = strtolower($href . ' ' . $anchor);
            if (strpos($lower, 'unsubscribe') !== false || strpos($lower, 'privacy') !== false) continue;
            if (strpos($lower, 'verify') !== false || strpos($lower, 'confirm') !== false || strpos($lower, 'dogrula') !== false || strpos($lower, 'onay') !== false || strpos($lower, 'token=') !== false) {
                $link = $href;
                $linkText = trim($anchor) ?: 'Onayla';
                break;
            }
        }
    }

    // Action Type
    $lowerAll = strtolower($subject . ' ' . $text);
    $actionType = 'generic';
    if (strpos($lowerAll, 'reset password') !== false || strpos($lowerAll, 'şifre') !== false) {
        $actionType = 'password_reset';
    } elseif ($otp || strpos($lowerAll, 'doğrulama') !== false || strpos($lowerAll, 'onay') !== false || strpos($lowerAll, 'verification') !== false) {
        $actionType = 'verification';
    } elseif (strpos($lowerAll, 'login') !== false || strpos($lowerAll, 'giriş') !== false) {
        $actionType = 'login';
    }

    $cleanSummary = "[E-posta Konusu]: $subject\n";
    if ($otp) $cleanSummary .= "[YAKALANAN OTP / DOĞRULAMA KODU]: $otp\n";
    if ($link) $cleanSummary .= "[ONAY / İŞLEM BAĞLANTISI]: $link\n";
    $cleanSummary .= "[İŞLEM TÜRÜ]: $actionType\n";
    $cleanSummary .= "[ÖZET METİN]: " . mb_substr(trim(preg_replace('/\s+/', ' ', $text)), 0, 200);

    return [
        'otpCode' => $otp,
        'otpContext' => $otpContext,
        'verificationLink' => $link,
        'actionText' => $linkText,
        'actionType' => $actionType,
        'cleanSummary' => $cleanSummary,
        'senderDomain' => substr(strrchr($fromAddress, "@"), 1) ?: '',
        'isAutomated' => true
    ];
}

// ==========================================
// 🚀 MODEL CONTEXT PROTOCOL (MCP) ENDPOINT
// Compatible with Smithery, Glama, Claude Desktop, Cursor
// Endpoints: /mcp, /api/v1/mcp, /mcp/messages, /api/v1/mcp/messages
// ==========================================

$mcpTools = [
    [
        'name' => 'gecici_create_inbox',
        'description' => 'Creates a new disposable temporary email inbox for receiving signups, verifications, or test emails.',
        'inputSchema' => [
            'type' => 'object',
            'properties' => [
                'prefix' => [
                    'type' => 'string',
                    'description' => 'Optional custom username prefix (e.g. "myagent_99"). If omitted, a random address is generated.'
                ],
                'domain' => [
                    'type' => 'string',
                    'description' => 'Optional domain name. Defaults to "gecici.email".'
                ]
            ]
        ]
    ],
    [
        'name' => 'gecici_wait_for_otp',
        'description' => 'Waits for an incoming verification email and directly extracts the 4-8 digit OTP code / SMS-like code.',
        'inputSchema' => [
            'type' => 'object',
            'properties' => [
                'address' => [
                    'type' => 'string',
                    'description' => 'The disposable email address to monitor (e.g. "agent123@gecici.email").'
                ],
                'timeout_seconds' => [
                    'type' => 'number',
                    'description' => 'Maximum time to wait in seconds (default: 30, max: 60).'
                ]
            ],
            'required' => ['address']
        ]
    ],
    [
        'name' => 'gecici_wait_for_magic_link',
        'description' => 'Waits for an incoming email and directly extracts the account verification button URL / magic login link.',
        'inputSchema' => [
            'type' => 'object',
            'properties' => [
                'address' => [
                    'type' => 'string',
                    'description' => 'The disposable email address to monitor.'
                ],
                'timeout_seconds' => [
                    'type' => 'number',
                    'description' => 'Maximum time to wait in seconds (default: 30, max: 60).'
                ]
            ],
            'required' => ['address']
        ]
    ],
    [
        'name' => 'gecici_get_inbox_messages',
        'description' => 'Lists all received messages in a disposable inbox, including senders, subjects, and extracted summaries.',
        'inputSchema' => [
            'type' => 'object',
            'properties' => [
                'address' => [
                    'type' => 'string',
                    'description' => 'The disposable email address to inspect.'
                ]
            ],
            'required' => ['address']
        ]
    ],
    [
        'name' => 'gecici_get_ai_summary',
        'description' => 'Returns a token-optimized, high-signal clean text summary of the latest email for LLMs.',
        'inputSchema' => [
            'type' => 'object',
            'properties' => [
                'address' => [
                    'type' => 'string',
                    'description' => 'The disposable email address.'
                ]
            ],
            'required' => ['address']
        ]
    ]
];

if (isset($_GET['server_card'])) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'name' => 'gecici-email-mcp',
        'version' => '1.0.0',
        'description' => 'Official Model Context Protocol (MCP) Server for gecici.email - Instant disposable temporary emails, smart OTP extraction, and verification links for AI Agents (Claude Desktop, Cursor, Windsurf).',
        'homepage' => 'https://gecici.email',
        'repository' => 'https://github.com/codeonthetable/gecici-email',
        'protocolVersion' => '2024-11-05',
        'capabilities' => ['tools' => ['listChanged' => false]],
        'tools' => $mcpTools
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

$isMcpPath = ($path === 'mcp' || $path === 'mcp/messages' || isset($_GET['mcp']) || strpos($uri, '/mcp') !== false);

if ($isMcpPath) {
    if ($method === 'GET') {
        $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
        if (strpos($accept, 'text/event-stream') !== false || isset($_GET['sse'])) {
            header('Content-Type: text/event-stream');
            header('Cache-Control: no-cache, no-transform');
            header('Connection: keep-alive');
            header('X-Accel-Buffering: no');

            $sessionId = bin2hex(random_bytes(16));
            echo "event: endpoint\n";
            echo "data: https://gecici.email/api/v1/mcp/messages?sessionId=" . $sessionId . "\n\n";
            @ob_flush(); @flush();

            for ($i = 0; $i < 10; $i++) {
                if (connection_aborted()) break;
                echo ": keepalive\n\n";
                @ob_flush(); @flush();
                sleep(3);
            }
            exit;
        } else {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'name' => 'gecici-email-mcp',
                'version' => '1.0.0',
                'protocolVersion' => '2024-11-05',
                'description' => 'Official Model Context Protocol (MCP) Server for gecici.email - Instant disposable temporary emails & OTP code extraction',
                'capabilities' => [
                    'tools' => [
                        'listChanged' => false
                    ]
                ],
                'serverInfo' => [
                    'name' => 'gecici-email-mcp',
                    'version' => '1.0.0'
                ],
                'tools' => $mcpTools
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
            exit;
        }
    }

    if ($method === 'POST') {
        $rawInput = file_get_contents('php://input');
        $rpc = json_decode($rawInput, true);

        if (!$rpc || !isset($rpc['jsonrpc'])) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Invalid JSON-RPC request']);
            exit;
        }

        $id = $rpc['id'] ?? null;
        $methodRpc = $rpc['method'] ?? '';
        $params = $rpc['params'] ?? [];

        header('Content-Type: application/json; charset=utf-8');

        if ($methodRpc === 'initialize') {
            echo json_encode([
                'jsonrpc' => '2.0',
                'id' => $id,
                'result' => [
                    'protocolVersion' => '2024-11-05',
                    'capabilities' => [
                        'tools' => (object)[]
                    ],
                    'serverInfo' => [
                        'name' => 'gecici-email-mcp',
                        'version' => '1.0.0'
                    ]
                ]
            ]);
            exit;
        }

        if ($methodRpc === 'notifications/initialized') {
            http_response_code(200);
            echo json_encode(['jsonrpc' => '2.0', 'result' => (object)[]]);
            exit;
        }

        if ($methodRpc === 'tools/list') {
            echo json_encode([
                'jsonrpc' => '2.0',
                'id' => $id,
                'result' => [
                    'tools' => $mcpTools
                ]
            ]);
            exit;
        }

        if ($methodRpc === 'tools/call') {
            $toolName = $params['name'] ?? '';
            $toolArgs = $params['arguments'] ?? [];
            $resultText = '';
            $isError = false;

            try {
                if ($toolName === 'gecici_create_inbox') {
                    $prefix = preg_replace('/[^a-z0-9._-]/', '', strtolower(trim($toolArgs['prefix'] ?? '')));
                    if ($prefix && strlen($prefix) >= 2) {
                        $address = "{$prefix}@gecici.email";
                    } else {
                        $adjectives = ['swift', 'pure', 'luna', 'nova', 'zen', 'spark', 'cloud', 'cyber', 'agent', 'fast'];
                        $adj = $adjectives[array_rand($adjectives)];
                        $num = rand(1000, 9999);
                        $address = strtolower("{$adj}_{$num}@gecici.email");
                    }
                    $token = bin2hex(random_bytes(12));
                    $now = (int)(microtime(true) * 1000);
                    $expiresAt = $now + (60 * 60 * 1000);

                    $stmt = $db->prepare("INSERT OR REPLACE INTO inboxes (address, token, created_at, expires_at) VALUES (?, ?, ?, ?)");
                    $stmt->execute([$address, $token, $now, $expiresAt]);

                    $resultText = json_encode([
                        'success' => true,
                        'inbox' => [
                            'address' => $address,
                            'token' => $token,
                            'createdAt' => $now,
                            'expiresAt' => $expiresAt,
                            'ttlSeconds' => 3600
                        ]
                    ], JSON_PRETTY_PRINT);
                }
                elseif ($toolName === 'gecici_wait_for_otp') {
                    $addr = strtolower(trim($toolArgs['address'] ?? ''));
                    $timeout = min(max((int)($toolArgs['timeout_seconds'] ?? 30), 5), 45);
                    $startWait = time();
                    $found = null;

                    while (time() - $startWait < $timeout) {
                        $stmt = $db->prepare("SELECT * FROM messages WHERE inbox_address = ? ORDER BY received_at DESC LIMIT 1");
                        $stmt->execute([$addr]);
                        $msg = $stmt->fetch(PDO::FETCH_ASSOC);
                        if ($msg) {
                            $s = json_decode($msg['smart_summary'], true);
                            if (!empty($s['otpCode'])) {
                                $found = $s;
                                break;
                            }
                        }
                        sleep(1);
                    }

                    if ($found) {
                        $resultText = json_encode([
                            'success' => true,
                            'otp' => $found['otpCode'],
                            'otpContext' => $found['otpContext'],
                            'actionType' => $found['actionType']
                        ], JSON_PRETTY_PRINT);
                    } else {
                        $resultText = json_encode([
                            'success' => false,
                            'error' => "No OTP received for {$addr} within {$timeout} seconds."
                        ], JSON_PRETTY_PRINT);
                    }
                }
                elseif ($toolName === 'gecici_wait_for_magic_link') {
                    $addr = strtolower(trim($toolArgs['address'] ?? ''));
                    $timeout = min(max((int)($toolArgs['timeout_seconds'] ?? 30), 5), 45);
                    $startWait = time();
                    $found = null;

                    while (time() - $startWait < $timeout) {
                        $stmt = $db->prepare("SELECT * FROM messages WHERE inbox_address = ? ORDER BY received_at DESC LIMIT 1");
                        $stmt->execute([$addr]);
                        $msg = $stmt->fetch(PDO::FETCH_ASSOC);
                        if ($msg) {
                            $s = json_decode($msg['smart_summary'], true);
                            if (!empty($s['verificationLink'])) {
                                $found = $s;
                                break;
                            }
                        }
                        sleep(1);
                    }

                    if ($found) {
                        $resultText = json_encode([
                            'success' => true,
                            'verificationLink' => $found['verificationLink'],
                            'actionText' => $found['actionText']
                        ], JSON_PRETTY_PRINT);
                    } else {
                        $resultText = json_encode([
                            'success' => false,
                            'error' => "No verification link received for {$addr} within {$timeout} seconds."
                        ], JSON_PRETTY_PRINT);
                    }
                }
                elseif ($toolName === 'gecici_get_inbox_messages') {
                    $addr = strtolower(trim($toolArgs['address'] ?? ''));
                    $stmt = $db->prepare("SELECT * FROM messages WHERE inbox_address = ? ORDER BY received_at DESC");
                    $stmt->execute([$addr]);
                    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $msgs = array_map(function($r) {
                        return [
                            'id' => $r['id'],
                            'from' => ['name' => $r['from_name'], 'address' => $r['from_address']],
                            'subject' => $r['subject'],
                            'date' => $r['date_str'],
                            'snippet' => mb_substr(strip_tags($r['text_content']), 0, 150),
                            'smartSummary' => json_decode($r['smart_summary'], true)
                        ];
                    }, $rows);

                    $resultText = json_encode(['success' => true, 'count' => count($msgs), 'messages' => $msgs], JSON_PRETTY_PRINT);
                }
                elseif ($toolName === 'gecici_get_ai_summary') {
                    $addr = strtolower(trim($toolArgs['address'] ?? ''));
                    $stmt = $db->prepare("SELECT * FROM messages WHERE inbox_address = ? ORDER BY received_at DESC LIMIT 1");
                    $stmt->execute([$addr]);
                    $msg = $stmt->fetch(PDO::FETCH_ASSOC);
                    if ($msg) {
                        $s = json_decode($msg['smart_summary'], true);
                        $resultText = json_encode([
                            'success' => true,
                            'subject' => $msg['subject'],
                            'summary' => $s['cleanSummary'] ?? $msg['text_content'],
                            'otp' => $s['otpCode'] ?? null,
                            'link' => $s['verificationLink'] ?? null
                        ], JSON_PRETTY_PRINT);
                    } else {
                        $resultText = json_encode(['success' => false, 'error' => 'Inbox empty'], JSON_PRETTY_PRINT);
                    }
                }
                else {
                    throw new Exception("Unknown tool: {$toolName}");
                }
            } catch (Exception $e) {
                $isError = true;
                $resultText = "Error: " . $e->getMessage();
            }

            echo json_encode([
                'jsonrpc' => '2.0',
                'id' => $id,
                'result' => [
                    'content' => [
                        [
                            'type' => 'text',
                            'text' => $resultText
                        ]
                    ],
                    'isError' => $isError
                ]
            ]);
            exit;
        }

        echo json_encode([
            'jsonrpc' => '2.0',
            'id' => $id,
            'error' => [
                'code' => -32601,
                'message' => "Method not found: {$methodRpc}"
            ]
        ]);
        exit;
    }
}

// ROUTING

// 2. Generate Random Inbox
if ($path === 'inbox/generate' && $method === 'POST') {
    header('Content-Type: application/json');
    $adjectives = ['swift', 'pure', 'luna', 'nova', 'zen', 'spark', 'cloud', 'cyber', 'agent', 'fast'];
    $adj = $adjectives[array_rand($adjectives)];
    $num = rand(1000, 9999);
    $address = strtolower("{$adj}_{$num}@gecici.email");
    $token = bin2hex(random_bytes(12));
    $now = (int)(microtime(true) * 1000);
    $expiresAt = $now + (60 * 60 * 1000);

    $stmt = $db->prepare("INSERT INTO inboxes (address, token, created_at, expires_at) VALUES (?, ?, ?, ?)");
    $stmt->execute([$address, $token, $now, $expiresAt]);

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'inbox' => [
            'address' => $address,
            'token' => $token,
            'createdAt' => $now,
            'expiresAt' => $expiresAt,
            'ttlSeconds' => 3600
        ]
    ]);
    exit;
}

// 3. Custom Inbox
if ($path === 'inbox/custom' && $method === 'POST') {
    header('Content-Type: application/json');
    $body = getJsonInput();
    $prefix = preg_replace('/[^a-z0-9._-]/', '', strtolower(trim($body['prefix'] ?? '')));
    if (strlen($prefix) < 2) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'En az 2 karakter olmalıdır']);
        exit;
    }

    $address = strtolower("{$prefix}@gecici.email");
    $token = bin2hex(random_bytes(12));
    $now = (int)(microtime(true) * 1000);
    $expiresAt = $now + (60 * 60 * 1000);

    $stmt = $db->prepare("INSERT OR REPLACE INTO inboxes (address, token, created_at, expires_at) VALUES (?, ?, ?, ?)");
    $stmt->execute([$address, $token, $now, $expiresAt]);

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'inbox' => [
            'address' => $address,
            'token' => $token,
            'createdAt' => $now,
            'expiresAt' => $expiresAt,
            'ttlSeconds' => 3600
        ]
    ]);
    exit;
}

// 4. SSE Stream
if (preg_match('#^inbox/([^/]+)/stream$#', $path, $m)) {
    $address = strtolower(urldecode($m[1]));

    header('Content-Type: text/event-stream');
    header('Cache-Control: no-cache');
    header('Connection: keep-alive');
    header('X-Accel-Buffering: no');

    $stmt = $db->prepare("SELECT * FROM inboxes WHERE address = ?");
    $stmt->execute([$address]);
    $inbox = $stmt->fetch(PDO::FETCH_ASSOC);

    $now = (int)(microtime(true) * 1000);
    if (!$inbox) {
        $expiresAt = $now + (60 * 60 * 1000);
        $token = bin2hex(random_bytes(12));
        $db->prepare("INSERT INTO inboxes (address, token, created_at, expires_at) VALUES (?, ?, ?, ?)")->execute([$address, $token, $now, $expiresAt]);
        $inbox = ['address' => $address, 'expires_at' => $expiresAt];
    }

    echo "data: " . json_encode(['type' => 'connected', 'address' => $address, 'expiresAt' => (int)$inbox['expires_at'], 'timestamp' => $now]) . "\n\n";
    @ob_flush();
    @flush();

    $lastSeenId = null;
    $startTime = time();
    while (time() - $startTime < 45) { // stream up to 45s per connection
        if (connection_aborted()) break;

        $q = $db->prepare("SELECT * FROM messages WHERE inbox_address = ? ORDER BY received_at DESC LIMIT 1");
        $q->execute([$address]);
        $latest = $q->fetch(PDO::FETCH_ASSOC);

        if ($latest && $latest['id'] !== $lastSeenId) {
            $lastSeenId = $latest['id'];
            $emailObj = [
                'id' => $latest['id'],
                'messageId' => $latest['message_id'],
                'from' => ['name' => $latest['from_name'], 'address' => $latest['from_address']],
                'subject' => $latest['subject'],
                'date' => $latest['date_str'],
                'text' => $latest['text_content'],
                'html' => $latest['html_content'],
                'smartSummary' => json_decode($latest['smart_summary'], true),
                'read' => (bool)$latest['read_flag'],
                'receivedAt' => (int)$latest['received_at']
            ];
            echo "data: " . json_encode(['type' => 'new_email', 'email' => $emailObj, 'timestamp' => (int)$latest['received_at']]) . "\n\n";
            @ob_flush();
            @flush();
        }

        echo ": heartbeat\n\n";
        @ob_flush();
        @flush();
        sleep(2);
    }
    exit;
}

// 5. AI OTP Endpoint
if (preg_match('#^inbox/([^/]+)/otp$#', $path, $m)) {
    header('Content-Type: application/json');
    $address = strtolower(urldecode($m[1]));
    $stmt = $db->prepare("SELECT * FROM messages WHERE inbox_address = ? ORDER BY received_at DESC LIMIT 1");
    $stmt->execute([$address]);
    $msg = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($msg) {
        $summary = json_decode($msg['smart_summary'], true);
        echo json_encode([
            'success' => true,
            'otp' => $summary['otpCode'],
            'otpContext' => $summary['otpContext'],
            'actionType' => $summary['actionType'],
            'sender' => ['name' => $msg['from_name'], 'address' => $msg['from_address']],
            'subject' => $msg['subject'],
            'receivedAt' => (int)$msg['received_at']
        ]);
    } else {
        http_response_code(408);
        echo json_encode(['success' => false, 'timeout' => true, 'error' => 'Henüz e-posta bulunamadı']);
    }
    exit;
}

// 6. AI Links Endpoint
if (preg_match('#^inbox/([^/]+)/links$#', $path, $m)) {
    header('Content-Type: application/json');
    $address = strtolower(urldecode($m[1]));
    $stmt = $db->prepare("SELECT * FROM messages WHERE inbox_address = ? ORDER BY received_at DESC LIMIT 1");
    $stmt->execute([$address]);
    $msg = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($msg) {
        $summary = json_decode($msg['smart_summary'], true);
        echo json_encode([
            'success' => true,
            'verificationLink' => $summary['verificationLink'],
            'actionText' => $summary['actionText'],
            'actionType' => $summary['actionType'],
            'sender' => ['name' => $msg['from_name'], 'address' => $msg['from_address']],
            'subject' => $msg['subject'],
            'receivedAt' => (int)$msg['received_at']
        ]);
    } else {
        http_response_code(408);
        echo json_encode(['success' => false, 'timeout' => true, 'error' => 'Henüz link bulunamadı']);
    }
    exit;
}

// 7. Get Inbox Messages
if (preg_match('#^inbox/([^/]+)/messages$#', $path, $m)) {
    header('Content-Type: application/json');
    $address = strtolower(urldecode($m[1]));
    $stmt = $db->prepare("SELECT * FROM messages WHERE inbox_address = ? ORDER BY received_at DESC");
    $stmt->execute([$address]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $messages = array_map(function($r) {
        return [
            'id' => $r['id'],
            'messageId' => $r['message_id'],
            'from' => ['name' => $r['from_name'], 'address' => $r['from_address']],
            'subject' => $r['subject'],
            'date' => $r['date_str'],
            'text' => $r['text_content'],
            'html' => $r['html_content'],
            'smartSummary' => json_decode($r['smart_summary'], true),
            'read' => (bool)$r['read_flag'],
            'receivedAt' => (int)$r['received_at']
        ];
    }, $rows);

    echo json_encode([
        'success' => true,
        'address' => $address,
        'count' => count($messages),
        'messages' => $messages
    ]);
    exit;
}

// 8. Inbox Metadata
if (preg_match('#^inbox/([^/]+)$#', $path, $m) && $method === 'GET') {
    header('Content-Type: application/json');
    $address = strtolower(urldecode($m[1]));
    $stmt = $db->prepare("SELECT * FROM inboxes WHERE address = ?");
    $stmt->execute([$address]);
    $inbox = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($inbox) {
        $countStmt = $db->prepare("SELECT COUNT(*) FROM messages WHERE inbox_address = ?");
        $countStmt->execute([$address]);
        $msgCount = (int)$countStmt->fetchColumn();

        echo json_encode([
            'success' => true,
            'inbox' => [
                'address' => $inbox['address'],
                'createdAt' => (int)$inbox['created_at'],
                'expiresAt' => (int)$inbox['expires_at'],
                'messageCount' => $msgCount,
                'ttlRemainingSeconds' => max(0, (int)(($inbox['expires_at'] - (microtime(true)*1000)) / 1000))
            ]
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Gelen kutusu bulunamadı']);
    }
    exit;
}

// 9. Extend Inbox
if (preg_match('#^inbox/([^/]+)/extend$#', $path, $m) && $method === 'POST') {
    header('Content-Type: application/json');
    $address = strtolower(urldecode($m[1]));
    $body = getJsonInput();
    $minutes = (int)($body['minutes'] ?? 30);
    $addMs = $minutes * 60 * 1000;

    $stmt = $db->prepare("UPDATE inboxes SET expires_at = expires_at + ? WHERE address = ?");
    $stmt->execute([$addMs, $address]);

    $fetch = $db->prepare("SELECT * FROM inboxes WHERE address = ?");
    $fetch->execute([$address]);
    $inbox = $fetch->fetch(PDO::FETCH_ASSOC);

    if ($inbox) {
        echo json_encode([
            'success' => true,
            'inbox' => [
                'address' => $inbox['address'],
                'expiresAt' => (int)$inbox['expires_at'],
                'ttlRemainingSeconds' => max(0, (int)(($inbox['expires_at'] - (microtime(true)*1000)) / 1000))
            ]
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Gelen kutusu bulunamadı']);
    }
    exit;
}

// 10. Delete Inbox
if (preg_match('#^inbox/([^/]+)$#', $path, $m) && $method === 'DELETE') {
    header('Content-Type: application/json');
    $address = strtolower(urldecode($m[1]));
    $db->prepare("DELETE FROM messages WHERE inbox_address = ?")->execute([$address]);
    $db->prepare("DELETE FROM inboxes WHERE address = ?")->execute([$address]);
    echo json_encode(['success' => true, 'message' => 'Gelen kutusu silindi']);
    exit;
}

// 11. Simulate Inbound Email
if ($path === 'simulate' && $method === 'POST') {
    header('Content-Type: application/json');
    $body = getJsonInput();
    $to = strtolower(trim($body['to'] ?? ''));
    if (!$to) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'to adresi gerekli']);
        exit;
    }

    $fromName = $body['fromName'] ?? 'Platform Güvenlik Servisi';
    $fromAddr = $body['from'] ?? 'security@platform.com';
    $subject = $body['subject'] ?? 'Doğrulama Kodunuz: ' . rand(100000, 999999);
    $text = $body['text'] ?? "Giriş kodunuz: " . rand(100000, 999999);
    $html = $body['html'] ?? "<p>$text</p>";

    $smart = extractSmartSummary($subject, $text, $html, $fromAddr);
    $msgId = bin2hex(random_bytes(8));
    $now = (int)(microtime(true) * 1000);

    // Ensure inbox exists
    $db->prepare("INSERT OR IGNORE INTO inboxes (address, token, created_at, expires_at) VALUES (?, ?, ?, ?)")
       ->execute([$to, bin2hex(random_bytes(12)), $now, $now + (60 * 60 * 1000)]);

    $stmt = $db->prepare("INSERT INTO messages (id, inbox_address, message_id, from_name, from_address, subject, date_str, text_content, html_content, smart_summary, read_flag, received_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)");
    $stmt->execute([
        $msgId,
        $to,
        "<sim-$msgId@gecici.email>",
        $fromName,
        $fromAddr,
        $subject,
        date('c'),
        $text,
        $html,
        json_encode($smart),
        $now
    ]);

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Simüle edilmiş e-posta başarıyla gelen kutusuna eklendi',
        'email' => [
            'id' => $msgId,
            'subject' => $subject,
            'from' => ['name' => $fromName, 'address' => $fromAddr],
            'smartSummary' => $smart,
            'receivedAt' => $now
        ]
    ]);
    exit;
}

// Fallback 404
http_response_code(404);
header('Content-Type: application/json');
echo json_encode(['success' => false, 'error' => 'Endpoint bulunamadı: ' . $path]);

#!/usr/bin/env python3
"""A small, dependency-free terminal client for the hosted gecici.email API.

This is client code only. Mail delivery, storage, and the hosted API are not
implemented in this repository.
"""

import getpass
import json
import re
import sys
from datetime import datetime
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import HTTPRedirectHandler, Request, build_opener


BASE_URL = "https://gecici.email/api/v1"
TIMEOUT_SECONDS = 15


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, request, file_pointer, code, message, headers, url):
        return None


class ApiError(Exception):
    def __init__(self, status, message):
        self.status = status
        super().__init__(message)


def clean_text(value, limit=4000):
    """Do not allow email content to inject terminal control sequences."""
    if not isinstance(value, str):
        return ""
    value = re.sub(r"\x1b\[[0-?]*[ -/]*[@-~]", "", value)
    value = "".join(char for char in value if char in "\n\t" or ord(char) >= 32)
    return value[:limit]


def display_time(milliseconds):
    try:
        return datetime.fromtimestamp(milliseconds / 1000).astimezone().strftime("%Y-%m-%d %H:%M")
    except (TypeError, ValueError, OverflowError, OSError):
        return "bilinmiyor"


class Client:
    def __init__(self, opener=None):
        self.opener = opener or build_opener(NoRedirect)

    def request(self, method, path, token=None, payload=None):
        headers = {"Accept": "application/json", "User-Agent": "gecici-email-client/1.0"}
        if token:
            headers["Authorization"] = "Bearer " + token
        data = None
        if payload is not None:
            headers["Content-Type"] = "application/json"
            data = json.dumps(payload).encode("utf-8")
        request = Request(BASE_URL + path, data=data, headers=headers, method=method)
        try:
            with self.opener.open(request, timeout=TIMEOUT_SECONDS) as response:
                status = response.status
                body = response.read(1024 * 1024)
        except HTTPError as error:
            status = error.code
            body = error.read(1024 * 1024)
        except (URLError, TimeoutError) as error:
            raise ApiError(0, "Bağlantı kurulamadı: " + str(error.reason if isinstance(error, URLError) else error)) from error
        try:
            result = json.loads(body)
        except (UnicodeDecodeError, ValueError) as error:
            raise ApiError(status, "Sunucu geçerli JSON döndürmedi") from error
        if not isinstance(result, dict):
            raise ApiError(status, "Sunucu beklenmeyen yanıt döndürdü")
        if status < 200 or status >= 300 or result.get("success") is False:
            message = clean_text(result.get("error") or "İstek başarısız", 300)
            raise ApiError(status, message)
        return result

    def create(self, prefix=None):
        if prefix is None:
            result = self.request("POST", "/inbox/generate")
        else:
            result = self.request("POST", "/inbox/custom", payload={"prefix": prefix})
        inbox = result.get("inbox")
        if not isinstance(inbox, dict) or not inbox.get("address") or not inbox.get("token"):
            raise ApiError(0, "Kutu oluşturma yanıtında adres veya token yok")
        return inbox

    def inbox_path(self, address):
        return "/inbox/" + quote(address, safe="")

    def info(self, address, token):
        return self.request("GET", self.inbox_path(address), token)["inbox"]

    def messages(self, address, token):
        return self.request("GET", self.inbox_path(address) + "/messages", token)

    def otp(self, address, token):
        return self.request("GET", self.inbox_path(address) + "/otp", token)

    def links(self, address, token):
        return self.request("GET", self.inbox_path(address) + "/links", token)

    def extend(self, address, token, minutes):
        return self.request("POST", self.inbox_path(address) + "/extend", token, {"minutes": minutes})

    def delete(self, address, token):
        return self.request("DELETE", self.inbox_path(address), token)


def show_messages(result):
    messages = result.get("messages") or []
    print("\nİleti sayısı:", len(messages))
    for index, message in enumerate(messages, 1):
        sender = message.get("from") or {}
        if not isinstance(sender, dict):
            sender = {}
        print("\n--- İleti", index, "---")
        print("Kimden:", clean_text(sender.get("address"), 200))
        print("Konu:", clean_text(message.get("subject"), 300))
        print("Tarih:", display_time(message.get("receivedAt")))
        print("Metin:\n" + (clean_text(message.get("text")) or "(Düz metin yok)"))
    if not messages:
        print("Henüz e-posta gelmedi. Boş kutu teslimat kanıtı değildir.")


def main():
    print("gecici.email — terminal uygulaması")
    print("Ücretsiz, yalnızca alıcı kutu. Token bu oturumda bellekte tutulur; dosyaya yazılmaz.")
    print("Yetkili testler için kullanın; hassas hesap veya gerçek kişilerin verileri için kullanmayın.")
    client = Client()
    address = None
    token = None

    while True:
        print("\nAktif kutu:", address or "yok")
        print("1 Rastgele kutu aç  2 Özel adres aç  3 Mevcut kutuya bağlan")
        print("4 İletileri yenile   5 OTP göster      6 Doğrulama linkini göster")
        print("7 Süre uzat         8 Kutuyu sil       0 Çıkış")
        try:
            choice = input("Seçim: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nÇıkılıyor.")
            return 0

        try:
            if choice == "0":
                return 0
            if choice in ("1", "2"):
                prefix = input("Adres adı (rakam ve -/_/. gerekli): ").strip() if choice == "2" else None
                inbox = client.create(prefix)
                address, token = inbox["address"], inbox["token"]
                print("\nAdres:", address)
                print("Erişim tokenı (gizli tutun, bu oturumdan sonra kurtarılamaz):", token)
                print("Bitiş:", display_time(inbox.get("expiresAt")))
            elif choice == "3":
                candidate_address = input("Tam e-posta adresi: ").strip().lower()
                candidate_token = getpass.getpass("Erişim tokenı: ").strip()
                if not candidate_address or not candidate_token:
                    print("Adres ve token zorunlu.")
                    continue
                info = client.info(candidate_address, candidate_token)
                address, token = candidate_address, candidate_token
                print("Bağlandı. Bitiş:", display_time(info.get("expiresAt")))
            elif choice in ("4", "5", "6", "7", "8"):
                if not address or not token:
                    print("Önce kutu açın veya mevcut kutuya bağlanın.")
                    continue
                if choice == "4":
                    show_messages(client.messages(address, token))
                elif choice == "5":
                    result = client.otp(address, token)
                    print("OTP:", clean_text(result.get("otp"), 100))
                elif choice == "6":
                    result = client.links(address, token)
                    print("Bağlantı (otomatik açılmaz):", clean_text(result.get("verificationLink"), 2000))
                elif choice == "7":
                    raw = input("Kaç dakika eklensin? (1-60): ").strip()
                    if not raw.isdecimal() or not 1 <= int(raw) <= 60:
                        print("1-60 arası tam sayı girin.")
                        continue
                    result = client.extend(address, token, int(raw))
                    print("Yeni bitiş:", display_time(result.get("inbox", {}).get("expiresAt")))
                elif choice == "8":
                    if input("Kutuyu kalıcı olarak silmek için 'sil' yazın: ").strip() != "sil":
                        print("Silme iptal edildi.")
                        continue
                    client.delete(address, token)
                    address, token = None, None
                    print("Kutu silindi.")
            else:
                print("Geçersiz seçim.")
        except ApiError as error:
            print("İşlem başarısız (HTTP {}): {}".format(error.status or "ağ", error))
            if error.status == 408:
                print("Henüz OTP veya bağlantı gelmemiş olabilir; bu başarı anlamına gelmez.")
        except (EOFError, KeyboardInterrupt):
            print("\nİşlem iptal edildi.")


if __name__ == "__main__":
    sys.exit(main())

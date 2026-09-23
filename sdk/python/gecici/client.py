import requests
import time
from typing import Optional, Dict, Any, List

class GeciciInbox:
    def __init__(self, address: str, token: str, expires_at: int, client: "GeciciEmail"):
        self.address = address
        self.token = token
        self.expires_at = expires_at
        self.client = client

    def get_messages(self) -> List[Dict[str, Any]]:
        """Gelen kutusundaki tüm mesajları listeler."""
        return self.client.get_messages(self.address)

    def wait_for_message(self, timeout: int = 30) -> Optional[Dict[str, Any]]:
        """Yeni bir e-posta gelene kadar bekler."""
        return self.client.wait_for_message(self.address, timeout=timeout)

    def wait_for_otp(self, timeout: int = 30) -> Optional[str]:
        """Gelen e-postadaki OTP / Doğrulama kodunu doğrudan döner."""
        return self.client.wait_for_otp(self.address, timeout=timeout)

    def wait_for_link(self, timeout: int = 30) -> Optional[str]:
        """Gelen e-postadaki onay / aktivasyon linkini doğrudan döner."""
        return self.client.wait_for_link(self.address, timeout=timeout)

    def get_ai_summary(self) -> Dict[str, Any]:
        """LLM modelleri için optimize edilmiş temiz özet metnini döner."""
        return self.client.get_ai_summary(self.address)

    def delete(self) -> bool:
        """Gelen kutusunu anında siler."""
        return self.client.delete_inbox(self.address)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            self.delete()
        except Exception:
            pass

    def __str__(self):
        return self.address

    def __repr__(self):
        return f"<GeciciInbox address='{self.address}' expires_at={self.expires_at}>"


class GeciciEmail:
    """
    gecici.email Python SDK
    AI Ajanları ve otonom botlar için hızlı geçici e-posta kütüphanesi.
    """
    def __init__(self, base_url: str = "https://gecici.email/api/v1", timeout: int = 30):
        self.base_url = base_url.rstrip("/")
        self.default_timeout = timeout

    def create_inbox(self, prefix: Optional[str] = None, domain: str = "gecici.email") -> GeciciInbox:
        """Yeni bir geçici e-posta kutusu oluşturur."""
        endpoint = f"{self.base_url}/inbox/custom" if prefix else f"{self.base_url}/inbox/generate"
        payload = {"prefix": prefix, "domain": domain} if prefix else {"domain": domain}

        resp = requests.post(endpoint, json=payload, timeout=self.default_timeout)
        resp.raise_for_status()
        data = resp.json()
        inbox_data = data["inbox"]
        return GeciciInbox(
            address=inbox_data["address"],
            token=inbox_data["token"],
            expires_at=inbox_data["expiresAt"],
            client=self
        )

    def get_messages(self, address: str) -> List[Dict[str, Any]]:
        resp = requests.get(f"{self.base_url}/inbox/{address}/messages", timeout=self.default_timeout)
        resp.raise_for_status()
        return resp.json().get("messages", [])

    def wait_for_message(self, address: str, timeout: int = 30) -> Optional[Dict[str, Any]]:
        resp = requests.get(f"{self.base_url}/inbox/{address}/wait?timeout={timeout * 1000}", timeout=timeout + 5)
        if resp.status_code == 200:
            return resp.json().get("message")
        return None

    def wait_for_otp(self, address: str, timeout: int = 30) -> Optional[str]:
        resp = requests.get(f"{self.base_url}/inbox/{address}/otp?timeout={timeout * 1000}", timeout=timeout + 5)
        if resp.status_code == 200:
            return resp.json().get("otp")
        return None

    def wait_for_link(self, address: str, timeout: int = 30) -> Optional[str]:
        resp = requests.get(f"{self.base_url}/inbox/{address}/links?timeout={timeout * 1000}", timeout=timeout + 5)
        if resp.status_code == 200:
            return resp.json().get("verificationLink")
        return None

    def get_ai_summary(self, address: str) -> Dict[str, Any]:
        resp = requests.get(f"{self.base_url}/inbox/{address}/ai-summary", timeout=self.default_timeout)
        resp.raise_for_status()
        return resp.json()

    def get_inbox(self, address: str, token: str = "") -> GeciciInbox:
        """Mevcut bir adrese ait GeciciInbox nesnesi oluşturur."""
        return GeciciInbox(
            address=address,
            token=token,
            expires_at=int(time.time()) + 3600,
            client=self
        )

    def delete_inbox(self, address: str) -> bool:
        resp = requests.delete(f"{self.base_url}/inbox/{address}", timeout=self.default_timeout)
        return resp.status_code == 200

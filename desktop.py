#!/usr/bin/env python3
"""Desktop window for the public gecici.email client (Python/Tkinter)."""

import queue
import threading
import tkinter as tk
from tkinter import messagebox, ttk

from app import ApiError, Client, clean_text, display_time


class DesktopApp:
    def __init__(self, root):
        self.root = root
        self.client = Client()
        self.address = None
        self.token = None
        self.busy = False
        self.results = queue.Queue()
        self.root.title("gecici.email — Gelen Kutusu")
        self.root.geometry("780x590")
        self.root.minsize(620, 450)

        frame = ttk.Frame(root, padding=16)
        frame.pack(fill="both", expand=True)
        ttk.Label(frame, text="gecici.email", font=("Arial", 20, "bold")).pack(anchor="w")
        ttk.Label(frame, text="Ücretsiz, yalnızca alıcı geçici e-posta • Canlı hizmete bağlanır").pack(anchor="w", pady=(0, 12))

        create_row = ttk.Frame(frame)
        create_row.pack(fill="x", pady=4)
        ttk.Button(create_row, text="Rastgele kutu aç", command=self.create_random).pack(side="left")
        ttk.Label(create_row, text="   veya özel ad:").pack(side="left")
        self.prefix = ttk.Entry(create_row, width=20)
        self.prefix.pack(side="left", padx=4)
        ttk.Button(create_row, text="Aç", command=self.create_custom).pack(side="left")

        connect_row = ttk.Frame(frame)
        connect_row.pack(fill="x", pady=4)
        ttk.Label(connect_row, text="Mevcut adres:").pack(side="left")
        self.address_entry = ttk.Entry(connect_row, width=31)
        self.address_entry.pack(side="left", padx=4)
        ttk.Label(connect_row, text="Token:").pack(side="left")
        self.token_entry = ttk.Entry(connect_row, width=18, show="•")
        self.token_entry.pack(side="left", padx=4)
        ttk.Button(connect_row, text="Bağlan", command=self.connect).pack(side="left")

        self.status = tk.StringVar(value="Kutu açık değil. Token uygulama kapanınca unutulur; dosyaya yazılmaz.")
        ttk.Label(frame, textvariable=self.status, wraplength=740).pack(anchor="w", pady=(9, 3))
        action_row = ttk.Frame(frame)
        action_row.pack(fill="x", pady=6)
        for label, action in (
            ("İletileri yenile", self.refresh),
            ("OTP göster", self.show_otp),
            ("Link göster", self.show_link),
            ("30 dk uzat", self.extend),
            ("Kutuyu sil", self.delete),
        ):
            ttk.Button(action_row, text=label, command=action).pack(side="left", padx=(0, 6))

        output_frame = ttk.Frame(frame)
        output_frame.pack(fill="both", expand=True)
        self.output = tk.Text(output_frame, wrap="word", state="disabled")
        scrollbar = ttk.Scrollbar(output_frame, command=self.output.yview)
        self.output.configure(yscrollcommand=scrollbar.set)
        self.output.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        ttk.Label(frame, text="Yalnızca yetkili testler için. Hassas hesap/gerçek kişi verisi kullanmayın. Linkler otomatik açılmaz.", wraplength=740).pack(anchor="w", pady=(8, 0))
        self.root.after(100, self.process_results)

    def write(self, value):
        self.output.configure(state="normal")
        self.output.delete("1.0", "end")
        self.output.insert("end", value)
        self.output.configure(state="disabled")

    def run_request(self, operation, on_success):
        if self.busy:
            return
        self.busy = True
        self.status.set("Sunucuya bağlanılıyor…")

        def worker():
            try:
                result = operation()
            except ApiError as error:
                self.results.put((False, error, None))
            except Exception:
                self.results.put((False, ApiError(0, "Beklenmeyen bağlantı hatası"), None))
            else:
                self.results.put((True, result, on_success))

        threading.Thread(target=worker, daemon=True).start()

    def process_results(self):
        try:
            while True:
                success, value, callback = self.results.get_nowait()
                if success:
                    self.finish_success(callback, value)
                else:
                    self.finish_error(value)
        except queue.Empty:
            pass
        self.root.after(100, self.process_results)

    def finish_error(self, error):
        self.busy = False
        self.status.set("İşlem başarısız (HTTP {}): {}".format(error.status or "ağ", error))
        if error.status == 408:
            self.write("Henüz OTP veya doğrulama bağlantısı gelmedi. Bu, teslimat başarısı değildir.")

    def finish_success(self, callback, result):
        self.busy = False
        callback(result)

    def require_inbox(self):
        if not self.address or not self.token:
            messagebox.showinfo("Kutu yok", "Önce kutu açın veya mevcut kutuya bağlanın.")
            return False
        return True

    def use_new_inbox(self, inbox):
        self.address, self.token = inbox["address"], inbox["token"]
        self.status.set("Aktif: {} • Bitiş: {}".format(self.address, display_time(inbox.get("expiresAt"))))
        self.write("Adres: {}\n\nErişim tokenı: {}\n\nTokenı gizli tutun. Uygulama bunu diske yazmaz; pencere kapanınca tekrar gösteremez.\nSadece adresi yetkili test akışınıza verin.".format(self.address, self.token))

    def create_random(self):
        self.run_request(self.client.create, self.use_new_inbox)

    def create_custom(self):
        prefix = self.prefix.get().strip()
        if not prefix:
            messagebox.showinfo("Adres adı", "Özel ad girin; rakam ve -/_/. gerekir.")
            return
        self.run_request(lambda: self.client.create(prefix), self.use_new_inbox)

    def connect(self):
        address = self.address_entry.get().strip().lower()
        token = self.token_entry.get().strip()
        if not address or not token:
            messagebox.showinfo("Eksik bilgi", "Adres ve erişim tokenı gerekli.")
            return

        def connected(info):
            self.address, self.token = address, token
            self.token_entry.delete(0, "end")
            self.status.set("Aktif: {} • Bitiş: {}".format(address, display_time(info.get("expiresAt"))))
            self.write("Kutuya bağlandı. İletileri yenileyebilirsiniz.")

        self.run_request(lambda: self.client.info(address, token), connected)

    def refresh(self):
        if not self.require_inbox():
            return

        def show(result):
            messages = result.get("messages") or []
            lines = ["{} ileti\n".format(len(messages))]
            for index, message in enumerate(messages, 1):
                sender = message.get("from") or {}
                if not isinstance(sender, dict):
                    sender = {}
                lines.append("\n--- İleti {} ---\nKimden: {}\nKonu: {}\nTarih: {}\n\n{}\n".format(
                    index, clean_text(sender.get("address"), 200),
                    clean_text(message.get("subject"), 300),
                    display_time(message.get("receivedAt")),
                    clean_text(message.get("text")) or "(Düz metin yok)",
                ))
            if not messages:
                lines.append("Henüz e-posta gelmedi. Boş kutu teslimat kanıtı değildir.")
            self.write("".join(lines))
            self.status.set("Aktif: {} • {} ileti".format(self.address, len(messages)))

        self.run_request(lambda: self.client.messages(self.address, self.token), show)

    def show_otp(self):
        if self.require_inbox():
            self.run_request(
                lambda: self.client.otp(self.address, self.token),
                lambda result: self.write("OTP: {}\nKonu: {}".format(clean_text(result.get("otp"), 100), clean_text(result.get("subject"), 300))),
            )

    def show_link(self):
        if self.require_inbox():
            self.run_request(
                lambda: self.client.links(self.address, self.token),
                lambda result: self.write("Doğrulama bağlantısı (otomatik açılmaz):\n{}".format(clean_text(result.get("verificationLink"), 2000))),
            )

    def extend(self):
        if self.require_inbox():
            self.run_request(
                lambda: self.client.extend(self.address, self.token, 30),
                lambda result: self.status.set("Aktif: {} • Yeni bitiş: {}".format(self.address, display_time(result.get("inbox", {}).get("expiresAt")))),
            )

    def delete(self):
        if not self.require_inbox() or not messagebox.askyesno("Kutuyu sil", "{} kutusunu silmek istiyor musunuz?".format(self.address)):
            return

        def deleted(_result):
            self.address, self.token = None, None
            self.status.set("Kutu silindi.")
            self.write("Kutu ve uygulama düzeyindeki iletiler silindi.")

        self.run_request(lambda: self.client.delete(self.address, self.token), deleted)


def main():
    root = tk.Tk()
    DesktopApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()

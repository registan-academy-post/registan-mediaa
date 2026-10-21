"""Collect photos and videos the owner sends to the bot and store them in the repo,
so Claude's scheduled runs can design with them. Run by GitHub Actions."""
import json, os, time, urllib.request, urllib.error
from datetime import datetime, timezone

TOKEN = os.environ["TELEGRAM_BOT_TOKEN"].strip()
API = f"https://api.telegram.org/bot{TOKEN}/"
FILE = f"https://api.telegram.org/file/bot{TOKEN}/"
OWNER = 5663766757
MAX = 20 * 1024 * 1024  # Bot API download limit

def call(method, params):
    req = urllib.request.Request(API + method, data=json.dumps(params).encode(), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)

def download(file_id, dest):
    info = call("getFile", {"file_id": file_id})
    if not info.get("ok"):
        return None
    with urllib.request.urlopen(FILE + info["result"]["file_path"], timeout=300) as r, open(dest, "wb") as f:
        f.write(r.read())
    return dest

def main():
    offset = int(open("inbox/offset.txt").read().strip() or 0)
    upd = call("getUpdates", {"offset": offset, "limit": 100, "timeout": 0, "allowed_updates": ["message"]})
    if not upd.get("ok"):
        print(upd); return
    known = {json.loads(l)["file_unique_id"] for l in open("inbox/index.jsonl", encoding="utf-8") if l.strip()}
    out = open("inbox/index.jsonl", "a", encoding="utf-8")
    for u in upd["result"]:
        offset = max(offset, u["update_id"] + 1)
        m = u.get("message") or {}
        if m.get("from", {}).get("id") != OWNER:
            continue
        kind, obj, ext = None, None, None
        if m.get("video"):
            kind, obj, ext = "video", m["video"], ".mp4"
        elif m.get("photo"):
            kind, obj, ext = "photo", m["photo"][-1], ".jpg"
        elif m.get("document"):
            mt = m["document"].get("mime_type", "")
            if mt.startswith("video/"):
                kind, obj, ext = "video", m["document"], ".mp4"
            elif mt.startswith("image/"):
                kind, obj, ext = "photo", m["document"], "." + mt.split("/")[-1].replace("jpeg", "jpg")
        if not kind or obj["file_unique_id"] in known:
            continue
        date = datetime.fromtimestamp(m["date"], timezone.utc).astimezone().strftime("%Y-%m-%d")
        path = f"inbox/{kind}s/{date}_{m['message_id']}{ext}"
        saved = None
        if obj.get("file_size", 0) <= MAX:
            try:
                saved = download(obj["file_id"], path)
            except Exception as e:
                print("download failed", e)
        rec = {"type": kind, "file_id": obj["file_id"], "file_unique_id": obj["file_unique_id"],
               "path": saved, "size": obj.get("file_size"), "caption": m.get("caption", ""),
               "date": datetime.fromtimestamp(m["date"], timezone.utc).isoformat(),
               "message_id": m["message_id"], "used": False}
        if kind == "video":
            rec.update({k: m["video"].get(k) for k in ("duration", "width", "height")} if m.get("video") else {})
        out.write(json.dumps(rec, ensure_ascii=False) + "\n"); known.add(obj["file_unique_id"])
        print("stored", kind, path if saved else "(too big, file_id only)")
    out.close()
    open("inbox/offset.txt", "w").write(str(offset))
    if upd["result"]:
        call("getUpdates", {"offset": offset, "limit": 1, "timeout": 0})

if __name__ == "__main__":
    main()

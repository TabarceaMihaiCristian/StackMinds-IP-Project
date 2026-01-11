import json
import urllib.request
import uuid

BASE = "http://localhost:8000/api/v1"


def post_json(path, data):
    url = BASE + path
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        url, data=body, headers={"Content-Type": "application/json"}, method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        return resp.read().decode("utf-8")


def get_with_auth(path, token):
    url = BASE + path
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"}, method="GET")
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.getcode()
            body = resp.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        status = e.code
        body = e.read().decode("utf-8")
    return status, body


def main():
    # login
    login_payload = {"email": "student@example.com", "password": "studentpassword"}
    token = None
    try:
        resp = post_json("/auth/login", login_payload)
        obj = json.loads(resp)
        token = obj.get("access_token")
        print("LOGIN success, token available")
    except Exception as e:
        # print error body if HTTPError
        try:
            import urllib.error

            if isinstance(e, urllib.error.HTTPError):
                print("Login HTTPError body:", e.read().decode("utf-8"))
        except Exception:
            pass
        print("Initial login failed (will attempt to register test user):", e)
        # try to register a test user
        try:
            unique_email = f"test-{uuid.uuid4().hex[:8]}@example.com"
            reg_payload = {
                "name": "Test Student",
                "email": unique_email,
                "password": "studentpassword",
                "role": "student",
            }
            r = post_json("/auth/register", reg_payload)
            print("Registered test student:", r)
            # retry login
            # update login payload to use the new unique email
            login_payload["email"] = reg_payload["email"]
            resp = post_json("/auth/login", login_payload)
            obj = json.loads(resp)
            token = obj.get("access_token")
            print("LOGIN success after register")
        except Exception as e2:
            try:
                import urllib.error

                if isinstance(e2, urllib.error.HTTPError):
                    print("Register HTTPError body:", e2.read().decode("utf-8"))
            except Exception:
                pass
            print("Register/login retry failed:", e2)
            return

    status, body = get_with_auth("/events?upcoming_only=true", token)
    print("HTTP_STATUS:", status)
    print("BODY:", body)


if __name__ == "__main__":
    main()

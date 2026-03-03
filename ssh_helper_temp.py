
import paramiko
import sys

def run_ssh_command(hostname, username, password, command):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(hostname, username=username, password=password)
        stdin, stdout, stderr = client.exec_command(command)
        print(f"STDOUT:\n{stdout.read().decode()}")
        print(f"STDERR:\n{stderr.read().decode()}")
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    host = "31.220.94.140"
    user = "root"
    pw = "Oo10203040"
    cmd = sys.argv[1] if len(sys.argv) > 1 else "ls /"
    run_ssh_command(host, user, pw, cmd)

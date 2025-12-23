# How to Run Commands in Ubuntu Desktop

## Method 1: Proxmox Console (Easiest)

### Steps:
1. **Open Proxmox Web Interface**
   - Go to: `https://192.168.1.20:8006`
   - Login to Proxmox

2. **Select Your VM**
   - Click on your VM in the left sidebar

3. **Open Console**
   - Click the **"Console"** button (usually top-right)
   - A new window/tab will open showing Ubuntu

4. **Login**
   - You'll see a login prompt
   - Username: `user`
   - Password: `user@123`
   - Press Enter after typing password

5. **You're Now in Terminal!**
   - You'll see: `user@ubuntu:~$`
   - This is where you type commands
   - Just start typing and press Enter

**Example:**
```
user@ubuntu:~$ sudo apt update
[Type your password when prompted]
```

---

## Method 2: Ubuntu Desktop GUI Terminal

### If You See Ubuntu Desktop (with icons, taskbar):

#### Option A: Keyboard Shortcut
- Press: **`Ctrl + Alt + T`**
- Terminal window opens immediately

#### Option B: Activities Menu
1. Click **"Activities"** button (top-left corner, or press `Super` key)
2. Type: **"Terminal"** or **"gnome-terminal"**
3. Click on **Terminal** icon

#### Option C: Right-Click Menu
1. Right-click on desktop (empty area)
2. Select **"Open Terminal Here"**

---

## What You'll See

### In Proxmox Console:
```
Ubuntu 24.04 LTS ubuntu tty1

ubuntu login: user
Password: [type user@123]

user@ubuntu:~$ 
```

### In Ubuntu Desktop Terminal:
```
user@ubuntu:~$ 
```

**Both are the same!** You can type commands in either.

---

## How to Type Commands

1. **Click in the terminal window** (or console)
2. **Type the command** (you'll see it appear as you type)
3. **Press Enter** to execute
4. **Wait for output** or password prompt

### Example:
```
user@ubuntu:~$ sudo apt update
[sudo] password for user: [type user@123, then press Enter]
```

**Note:** When typing password, you won't see any characters (not even dots). This is normal! Just type and press Enter.

---

## Common Issues

### "Command not found"
- Make sure you typed the command correctly
- Some commands need `sudo` prefix

### "Permission denied"
- Add `sudo` before the command
- Example: `sudo apt update` instead of `apt update`

### Can't see what you're typing
- Click in the terminal/console window
- Make sure it's active/focused

### Terminal closes immediately
- This happens if you run a GUI application
- Use Proxmox console instead, or add `&` at the end

---

## Quick Test

Try this command to verify terminal works:

```bash
echo "Hello, this is working!"
```

You should see: `Hello, this is working!`

---

## Next Steps

Once you can run commands, proceed with:

```bash
sudo apt update
sudo apt install -y openssh-server
sudo systemctl enable ssh
sudo systemctl start ssh
```



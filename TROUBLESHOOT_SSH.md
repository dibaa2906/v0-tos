# Troubleshooting SSH Connection to Proxmox VM

## Problem: Connection Timeout
```
ssh: connect to host 192.168.1.113 port 22: Operation timed out
```

## Solutions (Try in Order)

### Solution 1: Enable SSH on the VM

**WHERE:** Access your VM directly (not via SSH)

**Option A: Via Proxmox Web Console**

1. Open Proxmox web interface: `https://192.168.1.20:8006`
2. Login to Proxmox
3. Find your VM in the left sidebar
4. Click on your VM
5. Click **"Console"** button (top right)
6. Login to Ubuntu with:
   - Username: `user`
   - Password: `user@123`

**Option B: Via Ubuntu Desktop GUI (if you have desktop access)**

1. Open Terminal in Ubuntu Desktop
2. Run the commands below

**Once you have access to the VM, run these commands:**

```bash
# Enable SSH service
sudo systemctl enable ssh
sudo systemctl start ssh
sudo systemctl status ssh
```

**Verify SSH is running:**
```bash
sudo systemctl status ssh
```

You should see: `Active: active (running)`

---

### Solution 2: Check and Configure Firewall

**On the VM (via console/GUI):**

```bash
# Check if UFW is active
sudo ufw status

# If it's active and blocking, allow SSH
sudo ufw allow 22/tcp
sudo ufw reload

# Or disable firewall temporarily to test
sudo ufw disable
```

---

### Solution 3: Verify Correct IP Address

**On the VM (via console/GUI):**

```bash
# Check actual IP address
ip addr show
# or
ifconfig
# or
hostname -I
```

**Look for:** An IP address starting with `192.168.1.`

**Note the actual IP** - it might be different from 192.168.1.113

---

### Solution 4: Check VM Network Settings in Proxmox

1. Go to Proxmox web interface: `https://192.168.1.20:8006`
2. Select your VM
3. Go to **Hardware** → **Network Device**
4. Check:
   - **Bridge:** Should be set (usually `vmbr0`)
   - **Model:** Should be set (usually `VirtIO`)
5. If network device is missing, add one

---

### Solution 5: Test Network Connectivity

**On your local computer (Mac):**

```bash
# Ping the VM to check if it's reachable
ping 192.168.1.113

# Or try the other IP
ping 192.168.1.114
```

**If ping works but SSH doesn't:** SSH service is likely not running
**If ping doesn't work:** Network connectivity issue

---

### Solution 6: Check if VM is Running

1. Go to Proxmox web interface: `https://192.168.1.20:8006`
2. Check your VM status
3. If it's stopped, click **"Start"**
4. Wait for it to boot completely

---

## Quick Fix Script (Run on VM)

**Access VM via Proxmox Console, then run:**

```bash
#!/bin/bash
# Enable SSH and configure firewall

# Enable SSH
sudo systemctl enable ssh
sudo systemctl start ssh

# Allow SSH in firewall
sudo ufw allow 22/tcp

# Show IP address
echo "Your VM IP addresses:"
hostname -I

# Show SSH status
echo ""
echo "SSH Status:"
sudo systemctl status ssh --no-pager
```

---

## After Enabling SSH

Once SSH is enabled, try connecting again from your Mac:

```bash
ssh user@192.168.1.113
```

**Or if you found a different IP:**

```bash
ssh user@<actual-ip-address>
```

---

## Alternative: Use Proxmox Console for Initial Setup

If SSH continues to fail, you can do the initial setup via Proxmox Console:

1. Use Proxmox web console to access VM
2. Run all deployment commands directly in the console
3. Enable SSH during the process
4. Then switch to SSH for easier access

---

## Still Having Issues?

**Check these:**

1. ✅ VM is running in Proxmox
2. ✅ VM has network adapter configured
3. ✅ SSH service is installed and running
4. ✅ Firewall allows port 22
5. ✅ You're on the same network (192.168.1.x)
6. ✅ Correct IP address

**Get VM IP address:**
```bash
# On VM via console
hostname -I
```



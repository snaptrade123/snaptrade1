# SnapTrade VPS Deployment Guide

## Prerequisites
- Hostinger VPS with Ubuntu/CentOS
- Domain name pointed to VPS IP
- SSH access to VPS

## Step 1: Server Setup

### Install Node.js and npm
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### Install Nginx (Reverse Proxy)
```bash
sudo apt update
sudo apt install nginx
sudo systemctl enable nginx
```

## Step 2: Upload Your Project

### Option A: Using Git (Recommended)
```bash
cd /var/www
sudo git clone <your-repository-url> snaptrade
cd snaptrade
sudo npm install
sudo npm run build
```

### Option B: Using FTP/SCP
Upload all project files to `/var/www/snaptrade/`

## Step 3: Environment Variables

Create `.env` file in project root:
```bash
sudo nano /var/www/snaptrade/.env
```

Add your production environment variables:
```
NODE_ENV=production
PORT=3000
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_secure_session_secret
OPENAI_API_KEY=your_openai_api_key
NEWS_API_KEY=your_news_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

## Step 4: Database Setup

If using external PostgreSQL (recommended):
- Use your existing database connection
- Run migrations if needed

## Step 5: Start Application with PM2

```bash
cd /var/www/snaptrade
sudo pm2 start ecosystem.config.js --env production
sudo pm2 save
sudo pm2 startup
```

## Step 6: Configure Nginx

Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/snaptrade
```

Add configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/snaptrade /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 7: SSL Certificate (Optional but Recommended)

Install Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
```

Get SSL certificate:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Step 8: Firewall Configuration

```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## Managing Your Application

### View logs:
```bash
sudo pm2 logs snaptrade
```

### Restart application:
```bash
sudo pm2 restart snaptrade
```

### Update application:
```bash
cd /var/www/snaptrade
sudo git pull
sudo npm install
sudo npm run build
sudo pm2 restart snaptrade
```

## Important Notes

1. **Environment Variables**: Make sure all API keys are properly set
2. **Database**: Ensure your PostgreSQL database is accessible from VPS
3. **Domain**: Point your domain's A record to your VPS IP address
4. **Business Emails**: Configure through Hostinger's email hosting
5. **Backups**: Regular database and file backups are recommended

## Troubleshooting

- Check PM2 logs: `sudo pm2 logs`
- Check Nginx status: `sudo systemctl status nginx`
- Check application status: `sudo pm2 status`
- Check firewall: `sudo ufw status`
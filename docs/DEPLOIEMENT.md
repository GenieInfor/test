# 🚀 GUIDE DE DÉPLOIEMENT VPS - ShopCid (SQLite)
## Développé par Ibrahim Tembely alias Cid

---

## 📋 PRÉREQUIS

- VPS Ubuntu 22.04 LTS (2 vCPU, 2 Go RAM minimum)
- Nom de domaine pointant vers l'IP du VPS
- Accès SSH root

---

## ÉTAPE 1 — Mise à jour serveur

```bash
ssh root@VOTRE_IP
apt update && apt upgrade -y
adduser shopuser && usermod -aG sudo shopuser
su - shopuser
```

---

## ÉTAPE 2 — Installer Node.js 20

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20 && nvm use 20 && nvm alias default 20
node -v  # doit afficher v20.x.x
```

---

## ÉTAPE 3 — Installer Nginx + PM2

```bash
sudo apt install -y nginx
sudo systemctl start nginx && sudo systemctl enable nginx
npm install -g pm2
```

---

## ÉTAPE 4 — Transférer le projet

```bash
# Option A : SCP
scp -r ./shop shopuser@VOTRE_IP:/home/shopuser/

# Option B : Git
git clone https://votre-repo.git ~/shop
```

---

## ÉTAPE 5 — Configurer l'environnement

```bash
cd ~/shop
cp .env.example .env
nano .env
```

```env
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
NEXT_PUBLIC_SITE_URL=https://votre-domaine.com
ANTHROPIC_API_KEY=votre_cle_si_vous_voulez_lIA
```

---

## ÉTAPE 6 — Installer et initialiser

```bash
cd ~/shop
npm install

# Créer le dossier pour SQLite et uploads
mkdir -p data public/uploads

# Initialiser la base de données
npm run init-db

# Build production
npm run build
```

---

## ÉTAPE 7 — Configurer PM2

```bash
cat > ecosystem.config.js << 'CONF'
module.exports = {
  apps: [{
    name: 'shopcid',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/home/shopuser/shop',
    instances: 1,
    autorestart: true,
    env: { NODE_ENV: 'production', PORT: 3000 },
    error_file: '/home/shopuser/logs/error.log',
    out_file: '/home/shopuser/logs/out.log',
  }]
}
CONF

mkdir -p ~/logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u shopuser --hp /home/shopuser
# Copier-coller la commande affichée
```

---

## ÉTAPE 8 — Configurer Nginx

```bash
sudo nano /etc/nginx/sites-available/shopcid
```

```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    client_max_body_size 5M;

    location /_next/static/ {
        alias /home/shopuser/shop/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /uploads/ {
        alias /home/shopuser/shop/public/uploads/;
        expires 30d;
    }

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

```bash
sudo ln -s /etc/nginx/sites-available/shopcid /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

---

## ÉTAPE 9 — SSL (HTTPS)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

---

## ÉTAPE 10 — Pare-feu

```bash
sudo ufw allow ssh && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp
sudo ufw enable
```

---

## ÉTAPE 11 — Sauvegarde SQLite

```bash
# Script de sauvegarde simple (SQLite = 1 seul fichier !)
cat > ~/backup-db.sh << 'BACKUP'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/shopuser/backups"
mkdir -p $BACKUP_DIR
cp /home/shopuser/shop/data/shop.db $BACKUP_DIR/shop_$DATE.db
gzip $BACKUP_DIR/shop_$DATE.db
find $BACKUP_DIR -name "*.db.gz" -mtime +30 -delete
echo "Sauvegarde: shop_$DATE.db.gz"
BACKUP
chmod +x ~/backup-db.sh

# Automatiser chaque nuit à 2h
crontab -e
# Ajouter: 0 2 * * * /home/shopuser/backup-db.sh
```

---

## 🔄 MISE À JOUR

```bash
cd ~/shop
git pull origin main
npm install
npm run build
pm2 restart shopcid
```

---

## 🆘 COMMANDES UTILES

```bash
pm2 logs shopcid          # Logs en temps réel
pm2 restart shopcid       # Redémarrer
sudo systemctl reload nginx
sudo tail -f /var/log/nginx/error.log
```

---

*Développé par Ibrahim Tembely alias Cid*

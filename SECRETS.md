# Secrets Management with EJSON

This project uses [EJSON](https://github.com/Shopify/ejson) to manage encrypted secrets in version control.

## Overview

- **Encrypted file**: `secrets.ejson` (committed to git)
- **Private key location**: `.ejson/keys/` (NOT committed to git)
- **Public key**: `0e8b2ed031f10b285dfb58a84c3edaee4e53cc8fb498946a2f94a1ca783f667a`

## Setup for New Developers

### 1. Install EJSON

```bash
# macOS
brew install ejson

# Linux
go install github.com/Shopify/ejson/cmd/ejson@latest

# Or download from https://github.com/Shopify/ejson/releases
```

### 2. Get the Private Key

**IMPORTANT**: The private key should be shared securely (NOT via git). Ask a team member for the private key.

Once you have the private key, create the keys directory and save it:

```bash
mkdir -p .ejson/keys
echo "YOUR_PRIVATE_KEY_HERE" > .ejson/keys/0e8b2ed031f10b285dfb58a84c3edaee4e53cc8fb498946a2f94a1ca783f667a
```

### 3. Decrypt Secrets

```bash
# Decrypt to view secrets
EJSON_KEYDIR=.ejson/keys ejson decrypt secrets.ejson

# Or export to environment variables
export $(EJSON_KEYDIR=.ejson/keys ejson decrypt secrets.ejson | jq -r '.next_public | to_entries | .[] | "NEXT_PUBLIC_\(.key | ascii_upcase)=\(.value)"')
```

## Usage

### Viewing Secrets

```bash
# View all secrets
EJSON_KEYDIR=.ejson/keys ejson decrypt secrets.ejson

# View specific value
EJSON_KEYDIR=.ejson/keys ejson decrypt secrets.ejson | jq -r '.supabase.url'
```

### Updating Secrets

1. Decrypt the file to a temporary location:
   ```bash
   EJSON_KEYDIR=.ejson/keys ejson decrypt secrets.ejson > secrets.ejson.decrypted
   ```

2. Edit `secrets.ejson.decrypted` with your changes

3. Encrypt the changes back:
   ```bash
   EJSON_KEYDIR=.ejson/keys ejson encrypt secrets.ejson.decrypted
   mv secrets.ejson.decrypted secrets.ejson
   ```

4. Delete the decrypted file:
   ```bash
   rm secrets.ejson.decrypted
   ```

### Creating Environment Variables

The project expects these environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Create a `.env.local` file (which is gitignored) by decrypting secrets:

```bash
# Create .env.local from secrets
EJSON_KEYDIR=.ejson/keys ejson decrypt secrets.ejson | jq -r '
  "NEXT_PUBLIC_SUPABASE_URL=" + .next_public.supabase_url,
  "NEXT_PUBLIC_SUPABASE_ANON_KEY=" + .next_public.supabase_anon_key
' > .env.local
```

## Helper Scripts

For convenience, you can use these commands:

```bash
# View secrets (add to package.json scripts)
npm run secrets:view    # ejson decrypt secrets.ejson

# Update secrets
npm run secrets:update  # decrypt, edit, re-encrypt

# Generate .env.local
npm run secrets:env     # create .env.local from secrets.ejson
```

## Security Best Practices

1. **Never commit** the private key (`.ejson/keys/`) to git
2. **Never commit** decrypted files (`*.ejson.decrypted`)
3. **Never commit** `.env` or `.env.local` files
4. **Always encrypt** before committing changes to secrets.ejson
5. **Share private keys** via secure channels (1Password, encrypted email, etc.)
6. **Rotate keys** if they are ever accidentally exposed

## Secrets Structure

The `secrets.ejson` file contains:

```json
{
  "_public_key": "...",
  "environment": "development",
  "supabase": {
    "url": "your-supabase-project-url",
    "anon_key": "public anon key for client-side",
    "service_role_key": "admin key for server-side operations"
  },
  "next_public": {
    "supabase_url": "same as supabase.url",
    "supabase_anon_key": "same as supabase.anon_key"
  }
}
```

## Troubleshooting

### Error: "private key not found"

Make sure you have the private key in `.ejson/keys/` with the correct filename (the public key).

### Error: "failed to decrypt"

The file may have been corrupted or the wrong private key is being used.

### Where to get the Supabase keys?

1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the Project URL and the `anon public` key
4. Update secrets.ejson with these values

## For CI/CD

In your CI/CD environment, set the private key as an environment variable:

```bash
export EJSON_KEY="9746b0d77dfd0eb29916dacdf4dd8fe2e9244e5b54dc2f29b9ae441945fee322"
mkdir -p .ejson/keys
echo $EJSON_KEY > .ejson/keys/0e8b2ed031f10b285dfb58a84c3edaee4e53cc8fb498946a2f94a1ca783f667a
```

Then decrypt as normal in your build pipeline.

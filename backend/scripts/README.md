# Backend Scripts

Only two scripts are retained for now:

## Create Admin User

```shell
npm run create:admin -- --name "Admin One" --email "admin1@test.com" --password "admin@123"
```

Or use environment variables:

```shell
set ADMIN_NAME=Admin One
set ADMIN_EMAIL=admin1@test.com
set ADMIN_PASSWORD=admin@123
npm run create:admin
```

## Create Verifier User

```shell
npm run create:verifier -- --name "Verifier One" --email "verifier1@test.com" --password "verifier@123"
```

Or use environment variables:

```shell
set VERIFIER_NAME=Verifier One
set VERIFIER_EMAIL=verifier1@test.com
set VERIFIER_PASSWORD=verifier@123
npm run create:verifier
```

Both scripts use `DATABASE_URL` from the backend `.env` file.

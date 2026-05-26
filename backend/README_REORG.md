Reorganization performed:
- Moved API endpoint files from `api/` to `controllers/` with subfolders `auth`, `orders`, `bookings`.
- Created `routes/api.php` as the router and updated `index.php` to require it.
- Moved helpers to `utils/helpers.php` and updated `init.php` to require it.
- Adjusted controller files to bootstrap via `init.php`.

Notes:
- After deployment, ensure `BASE_PATH` in `routes/api.php` matches your server path.
- Check file permissions for `uploads/`.

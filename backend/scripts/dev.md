# Backend Dev Scripts

All commands assume the virtual environment is activated:

```
# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

## Run server

```
uvicorn app.main:app --reload
```

## Lint

```
ruff check app
```

## Lint with auto-fix

```
ruff check app --fix
```

## Format

```
black app
```

## Sort imports

```
isort app
```

## Full check (format + lint)

```
black app && isort app && ruff check app
```

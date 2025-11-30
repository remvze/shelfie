# Shelfie 🤳

Shelfie is a CLI tool for tracking your media consumption. Stop opening slow web apps just to log that you read a chapter  or watched an episode.

Keep your books, movies, games, and series in your terminal.

## Installation

```bash
npm install -g shelfie
```

## Usage

### 1. The Basics

```bash
# Add items
shelfie add "The Pragmatic Programmer" -t book
shelfie add "Elden Ring" -t game --priority 3

# See what you're doing now
shelfie now

# Start an item
shelfie start "Elden"
```

### 2. Tracking Progress

```bash
# Log progress (fuzzy match works!)
shelfie log "Pragmatic" "Page 45" "Loved this section!"

# View your journey
shelfie details "Pragmatic"
```

### 3. Wrapping Up

```bash
# Finish an item
shelfie finish "Elden Ring" 5
```

### 4. Can Decide?

```bash
# Pick a random high-priority game from your backlog
shelfie pick --type game
```

## Command Reference

| Command | Description |
|---------|-------------|
| `add <title>` | Add to backlog. |
| `ls` | List all items. |
| `now` | Show active itmes. |
| `next` | Show high-priority backlog. |
| `history` | Show finished items. |
| `start <id>` | Move to Active. |
| `log <id>` | Update progress & add notes. |
| `finish <id>` | Mark as complete & rate. |
| `pick` | Randomly choose an item. |
| `details <id>` | View full history/timeline. |
| `stats` | View consumption analytics. |

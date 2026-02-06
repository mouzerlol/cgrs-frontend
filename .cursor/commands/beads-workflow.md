# Beads Quick Commands for Claude Code

## Most Common Commands

```bash
# List all open issues
bd list

# Create new issue
bd create "Task description" --priority 2

# Start working on an issue
bd update cgrs-frontend-XXX --status in_progress

# Mark issue complete
bd update cgrs-frontend-XXX --status closed

# Add progress notes
bd comment cgrs-frontend-XXX "Completed X, Y still pending"

# Sync to git
bd sync
```

## Integration with Git Commits

When committing, reference the issue ID:
```bash
git commit -m "feat: add navigation tabs [cgrs-frontend-3n5]"
```

## Quick Issue Status Check
```bash
bd status  # Overview of all issues
bd show cgrs-frontend-XXX  # Detailed view of specific issue
```

See BEADS.md for full documentation.

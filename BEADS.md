# Beads Integration with Claude Code

## Overview
This project uses **Beads** for AI-native issue tracking. Issues live in `.beads/issues.jsonl` and sync with git like code.

## Quick Reference for Claude Code

### Common Commands

```bash
# List all issues
bd list 

# List with more detail
bd list -v

# Create a new issue
bd create "Issue title" --description "Detailed description" --priority 1

# Show full issue details
bd show <issue-id>

# Update issue status
bd update <issue-id> --status in_progress
bd update <issue-id> --status closed
bd update <issue-id> --status blocked

# Update issue details
bd update <issue-id> --description "New description"
bd update <issue-id> --priority 1
bd update <issue-id> --owner "email@example.com"

# Add comments to issues
bd comment <issue-id> "Your comment here"

# Sync with git remote
bd sync

# Export database to JSONL (auto-happens, but can be manual)
bd export

# Import JSONL into database
bd import
```

### Issue Statuses
- `open` - New or not started
- `in_progress` - Currently being worked on
- `blocked` - Blocked by something
- `closed` - Completed
- `wontfix` - Not going to be done

### Priority Levels
- `1` - Critical/Highest
- `2` - High
- `3` - Medium (default)
- `4` - Low
- `5` - Lowest

### Issue Types
- `task` - Regular development task
- `bug` - Bug fix
- `feature` - New feature
- `epic` - Large feature/initiative
- `spike` - Research or investigation

## Workflow with Claude Code

### When Starting Work
```bash
# See what needs to be done
bd list

# Pick an issue and mark it in progress
bd update cgrs-frontend-XXX --status in_progress

# View full details
bd show cgrs-frontend-XXX
```

### During Development
```bash
# Add progress notes
bd comment cgrs-frontend-XXX "Implemented X, working on Y next"

# If blocked
bd update cgrs-frontend-XXX --status blocked
bd comment cgrs-frontend-XXX "Blocked by: need design decision on..."
```

### When Complete
```bash
# Mark as closed
bd update cgrs-frontend-XXX --status closed

# Sync to git
bd sync
```

## Integration Tips

### For Claude Code Users
1. **Before starting**: `bd list` to see what's prioritized
2. **Pick an issue**: Use issue ID in git commits: `git commit -m "feat: add navigation [cgrs-frontend-3n5]"`
3. **Track progress**: Update status and add comments as you work
4. **After completion**: Mark done and sync

### Creating Good Issues
```bash
# Good: Specific, actionable, has context
bd create "Fix mobile menu overlay z-index" \
  --description "Menu appears behind modal on iOS Safari. Need z-index: 9999" \
  --priority 2 \
  --type bug

# Good: Feature with clear scope
bd create "Add event RSVP functionality" \
  --description "Users should be able to RSVP to events. Needs: button, confirmation, count display" \
  --priority 1 \
  --type feature
```

## Current Project Issues

### Active Issue
- **cgrs-frontend-3n5**: Discussion navigation redesign
  - Status: Open (P2 Task)
  - Owner: dameon.andersen@clearpoint.co.nz
  - Description: Replace three-column button design with left sidebar tabs (like management-request page)

## Architecture Notes

### How Beads Works
- **Database**: SQLite (`.beads/beads.db`) - fast local queries
- **JSONL**: Human-readable (`.beads/issues.jsonl`) - git sync
- **Daemon**: Background process (`.beads/bd.sock`) - auto-sync
- **Git-native**: JSONL is version controlled, database is gitignored

### Files in .beads/
- `beads.db*` - SQLite database (gitignored)
- `issues.jsonl` - Issue data (version controlled) ✓
- `config.yaml` - Beads configuration (version controlled) ✓
- `README.md` - Generated docs (version controlled) ✓
- `daemon.*` - Runtime files (gitignored)
- `interactions.jsonl` - Audit log (version controlled) ✓

## Troubleshooting

### Sync Conflicts
```bash
# If you see "JSONL content has changed" error
bd import   # Import external changes
bd export   # Export your changes

# Check daemon status
bd list -v  # Shows daemon health at bottom
```

### Daemon Issues
```bash
# Restart daemon
bd daemon restart

# Check daemon logs
tail .beads/daemon.log
```

### Git Sync
```bash
# Sync issues with remote (like git push for issues)
bd sync

# Manual process:
bd export              # Export DB to JSONL
git add .beads/issues.jsonl
git commit -m "Update issues"
git push
```

## Resources
- GitHub: https://github.com/steveyegge/beads
- Docs: https://github.com/steveyegge/beads/tree/main/docs
- Run: `bd quickstart` for interactive guide

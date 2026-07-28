#!/bin/bash
# Usage: ./scripts/start-ticket.sh STO-1 add-equipment-temp-rule
TICKET=$1
BRANCH="feature/$TICKET-$2"

git fetch origin
git worktree add ../$BRANCH -b $BRANCH origin/main
echo "✓ Worktree ready at ../$BRANCH"
echo "  cd ../$BRANCH && claude"

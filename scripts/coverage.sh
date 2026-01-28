#!/bin/bash
# Parse Go coverage and output both statement and function coverage per package

cd "$(dirname "$0")/../vendor/experian" || exit 1

# Run tests with coverage profile
go test -coverprofile=coverage.out ./... 2>/dev/null

# Get statement coverage per package
echo "=== STATEMENT COVERAGE ==="
go test -cover ./... 2>/dev/null | grep -E "^ok|coverage:" | while read line; do
    if [[ $line == ok* ]]; then
        pkg=$(echo "$line" | awk '{print $2}')
        cov=$(echo "$line" | grep -oE '[0-9]+\.[0-9]+%' | head -1)
        if [ -n "$cov" ]; then
            echo "$pkg: $cov"
        fi
    fi
done

# Get function coverage per package
echo ""
echo "=== FUNCTION COVERAGE ==="
go tool cover -func=coverage.out 2>/dev/null | grep -v "^total:" | awk -F: '{
    # Extract package from path
    split($1, parts, "/")
    pkg = ""
    for (i=1; i<=length(parts)-1; i++) {
        if (pkg != "") pkg = pkg "/"
        pkg = pkg parts[i]
    }
    # Get coverage percentage
    pct = $NF
    gsub(/[^0-9.]/, "", pct)
    if (pct != "" && pct+0 >= 0) {
        funcs[pkg]++
        if (pct+0 > 0) covered[pkg]++
    }
}
END {
    for (pkg in funcs) {
        if (funcs[pkg] > 0) {
            pct = (covered[pkg] / funcs[pkg]) * 100
            printf "%s: %.1f%% (%d/%d functions)\n", pkg, pct, covered[pkg], funcs[pkg]
        }
    }
}'

# Cleanup
rm -f coverage.out

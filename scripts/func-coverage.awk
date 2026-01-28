#!/usr/bin/awk -f
# Calculate function coverage per package from go tool cover -func output
BEGIN { }
/^total:/ { next }
{
    # Parse: path/to/file.go:line: funcName pct%
    split($1, pathparts, ":")
    filepath = pathparts[1]

    # Extract package (everything except filename)
    n = split(filepath, parts, "/")
    pkg = ""
    for (i = 1; i < n; i++) {
        if (i > 1) pkg = pkg "/"
        pkg = pkg parts[i]
    }

    # Get coverage percentage
    pct = $NF
    gsub(/%/, "", pct)

    if (pkg != "" && pct != "") {
        total[pkg]++
        if (pct + 0 > 0) covered[pkg]++
    }
}
END {
    for (pkg in total) {
        pct = (covered[pkg] + 0) / total[pkg] * 100
        printf "%s|%.1f|%d|%d\n", pkg, pct, covered[pkg] + 0, total[pkg]
    }
}

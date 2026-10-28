package vault

import (
    "strings"
    "testing"
)

func TestIDHash(t *testing.T) {
    valid := strings.Repeat("ab", 32)

    first, err := IDHash(valid)
    if err != nil || len(first) != 32 {
        t.Fatalf("IDHash(valid) = %x, %v", first, err)
    }
    second, _ := IDHash(valid)
    if string(first) != string(second) {
        t.Error("IDHash should be stable for the same id")
    }
    if string(first) == string(must(t, strings.Repeat("cd", 32))) {
        t.Error("different ids should hash differently")
    }

    for _, bad := range []string{"", "abc", strings.Repeat("ab", 31), strings.Repeat("zz", 32), strings.Repeat("ab", 33)} {
        if _, err := IDHash(bad); err == nil {
            t.Errorf("IDHash(%q) should fail", bad)
        }
    }
}

func must(t *testing.T, id string) []byte {
    hash, err := IDHash(id)
    if err != nil {
        t.Fatal(err)
    }
    return hash
}

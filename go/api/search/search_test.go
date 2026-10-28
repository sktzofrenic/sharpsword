package search

import (
    "reflect"
    "testing"
)

func TestParseBooks(t *testing.T) {
    valid := map[string][]int32{
        "":         nil,
        "  ":       nil,
        "1":        {1},
        "1,40, 66": {1, 40, 66},
    }
    for param, want := range valid {
        got, err := ParseBooks(param)
        if err != nil || !reflect.DeepEqual(got, want) {
            t.Errorf("ParseBooks(%q) = %v, %v; want %v", param, got, err, want)
        }
    }

    for _, param := range []string{"0", "67", "gen", "1,,2", "-1"} {
        if _, err := ParseBooks(param); err == nil {
            t.Errorf("ParseBooks(%q) should fail", param)
        }
    }
}

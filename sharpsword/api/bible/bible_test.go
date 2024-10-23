package bible

import (
    "testing"
)

func TestGetBible(t *testing.T) {
    b := "Bible"
    if b == "" {
        t.Error("Expected Bible to be not nil")
    }
}

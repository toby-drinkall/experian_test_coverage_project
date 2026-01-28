package probe

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// I think we can use this test to be FileExist unit test function as well.
func TestWriteFile(t *testing.T) {
	var fileName string = "testfile"
	var expected bool = true
	WriteFile(fileName)

	// check is file exist
	result, err := FileExists(fileName)
	require.NoError(t, err)
	assert.Equal(t, expected, result)

	// delete file afterwards
	DeleteFile(fileName)

}

func TestDeleteFile(t *testing.T) {
	var fileName string = "testfile"
	var expected bool = false
	WriteFile(fileName)

	// delete file afterwards
	DeleteFile(fileName)

	// check is file exist
	result, err := FileExists(fileName)
	require.NoError(t, err)

	assert.Equal(t, expected, result)
}

func TestDeleteFileNonExistent(t *testing.T) {
	// Test deleting a file that doesn't exist - covers the error path
	DeleteFile("non_existent_file_12345")
	// The function logs an error but doesn't return it, so we just verify it doesn't panic
}

func TestWriteFileInvalidPath(t *testing.T) {
	// Test writing to an invalid path - covers the error path
	WriteFile("/invalid/path/that/does/not/exist/testfile")
	// The function logs an error but doesn't return it, so we just verify it doesn't panic
}

func TestFileExistsOnNonExistentFile(t *testing.T) {
	// Test FileExists on a file that doesn't exist
	result, err := FileExists("definitely_not_a_real_file_12345")
	require.NoError(t, err)
	assert.False(t, result)
}

//Copyright 2020 Expedia, Inc.
//
//Licensed under the Apache License, Version 2.0 (the "License");
//you may not use this file except in compliance with the License.
//You may obtain a copy of the License at
//
//http://www.apache.org/licenses/LICENSE-2.0
//
//Unless required by applicable law or agreed to in writing, software
//distributed under the License is distributed on an "AS IS" BASIS,
//WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//See the License for the specific language governing permissions and
//limitations under the License.

package flags

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestHTTPHeaders_String(t *testing.T) {
	h := HTTPHeaders{
		Headers: stringArray{"Content-Type: application/json", "Authorization: Bearer token"},
	}
	result := h.String()
	assert.Contains(t, result, "Content-Type: application/json")
	assert.Contains(t, result, "Authorization: Bearer token")
}

func TestHTTPHeaders_getWarmupHTTPHeaders(t *testing.T) {
	h := HTTPHeaders{
		Headers: stringArray{"Content-Type: application/json", "X-Custom-Header: value"},
	}
	headers := h.getWarmupHTTPHeaders()
	assert.Equal(t, 2, len(headers))
	assert.Equal(t, "Content-Type: application/json", headers[0])
	assert.Equal(t, "X-Custom-Header: value", headers[1])
}

func TestHTTPHeaders_getWarmupHTTPHeadersEmpty(t *testing.T) {
	h := HTTPHeaders{}
	headers := h.getWarmupHTTPHeaders()
	assert.Equal(t, 0, len(headers))
}

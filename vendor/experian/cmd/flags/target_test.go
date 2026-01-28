//Copyright 2019 Expedia, Inc.
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

func TestTarget_String(t *testing.T) {
	target := Target{
		HTTPProtocol:            "http1",
		HTTPHost:                "http://localhost",
		HTTPPort:                8080,
		HTTPTimeoutMilliseconds: 10000,
		GrpcHost:                "localhost",
		GrpcPort:                50051,
		GrpcTimeoutMilliseconds: 1000,
		ReadinessProtocol:       "http",
		ReadinessHTTPPath:       "/ready",
		ReadinessHTTPHost:       "http://localhost",
		ReadinessGrpcMethod:     "grpc.health.v1.Health/Check",
		ReadinessPort:           8080,
		Insecure:                false,
	}
	result := target.String()
	assert.Contains(t, result, "HTTPHost:http://localhost")
	assert.Contains(t, result, "HTTPPort:8080")
}

func TestToIntOrDefaultIfNull_WithValue(t *testing.T) {
	value := 42
	result := toIntOrDefaultIfNull(&value, 10)
	assert.Equal(t, 42, result)
}

func TestToIntOrDefaultIfNull_WithNil(t *testing.T) {
	result := toIntOrDefaultIfNull(nil, 10)
	assert.Equal(t, 10, result)
}

func TestToStringOrDefaultIfNull_WithValue(t *testing.T) {
	value := "test"
	result := toStringOrDefaultIfNull(&value, "default")
	assert.Equal(t, "test", result)
}

func TestToStringOrDefaultIfNull_WithNil(t *testing.T) {
	result := toStringOrDefaultIfNull(nil, "default")
	assert.Equal(t, "default", result)
}

func TestTarget_getWarmupTargetOptions(t *testing.T) {
	target := Target{
		ReadinessProtocol:   "http",
		ReadinessHTTPPath:   "/ready",
		ReadinessGrpcMethod: "grpc.health.v1.Health/Check",
		ReadinessPort:       8080,
	}
	options := target.getWarmupTargetOptions()
	assert.Equal(t, "http", options.ReadinessProtocol)
	assert.Equal(t, "/ready", options.ReadinessHTTPPath)
	assert.Equal(t, "grpc.health.v1.Health/Check", options.ReadinessGrpcMethod)
	assert.Equal(t, 8080, options.ReadinessPort)
}

func TestTarget_getReadinessHTTPClient(t *testing.T) {
	target := Target{
		ReadinessHTTPHost:       "http://localhost",
		ReadinessPort:           8080,
		Insecure:                false,
		HTTPTimeoutMilliseconds: 10000,
		HTTPProtocol:            "http1",
	}
	client := target.getReadinessHTTPClient()
	assert.NotNil(t, client)
}

func TestTarget_getReadinessGrpcClient(t *testing.T) {
	target := Target{
		GrpcHost:                "localhost",
		ReadinessPort:           50051,
		Insecure:                false,
		GrpcTimeoutMilliseconds: 1000,
	}
	client := target.getReadinessGrpcClient()
	assert.NotNil(t, client)
}

func TestTarget_getHTTPClient(t *testing.T) {
	target := Target{
		HTTPHost:                "http://localhost",
		HTTPPort:                8080,
		Insecure:                false,
		HTTPTimeoutMilliseconds: 10000,
		HTTPProtocol:            "http1",
	}
	client := target.getHTTPClient()
	assert.NotNil(t, client)
}

func TestTarget_getGrpcClient(t *testing.T) {
	target := Target{
		GrpcHost:                "localhost",
		GrpcPort:                50051,
		Insecure:                false,
		GrpcTimeoutMilliseconds: 1000,
	}
	client := target.getGrpcClient()
	assert.NotNil(t, client)
}

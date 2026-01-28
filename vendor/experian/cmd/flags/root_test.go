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
	"github.com/stretchr/testify/require"
)

func TestRoot_String(t *testing.T) {
	r := Root{
		MaxDurationSeconds:       60,
		MaxReadinessWaitSeconds:  30,
		MaxWarmupDurationSeconds: 30,
		Concurrency:              2,
		RequestDelayMilliseconds: 500,
		ConcurrencyTargetSeconds: 0,
		ExitAfterWarmup:          false,
		FailReadiness:            false,
	}
	result := r.String()
	assert.Contains(t, result, "MaxDurationSeconds:60")
	assert.Contains(t, result, "Concurrency:2")
}

func TestRoot_InitFlags(t *testing.T) {
	r := &Root{}
	r.InitFlags()
}

func TestRoot_GetMaxDurationSeconds(t *testing.T) {
	r := Root{MaxDurationSeconds: 120}
	assert.Equal(t, 120, r.GetMaxDurationSeconds())
}

func TestRoot_GetMaxReadinessWaitSeconds(t *testing.T) {
	r := Root{MaxReadinessWaitSeconds: 45}
	assert.Equal(t, 45, r.GetMaxReadinessWaitSeconds())
}

func TestRoot_GetMaxWarmupDurationSeconds(t *testing.T) {
	r := Root{MaxWarmupDurationSeconds: 60}
	assert.Equal(t, 60, r.GetMaxWarmupDurationSeconds())
}

func TestRoot_GetConcurrencyTargetSeconds(t *testing.T) {
	r := Root{ConcurrencyTargetSeconds: 10}
	assert.Equal(t, 10, r.GetConcurrencyTargetSeconds())
}

func TestRoot_GetConcurrency(t *testing.T) {
	r := Root{Concurrency: 4}
	assert.Equal(t, 4, r.GetConcurrency())
}

func TestRoot_GetReadinessHTTPClient(t *testing.T) {
	r := Root{
		Target: Target{
			ReadinessHTTPHost:       "http://localhost",
			ReadinessPort:           8080,
			Insecure:                false,
			HTTPTimeoutMilliseconds: 10000,
			HTTPProtocol:            "http1",
		},
	}
	client := r.GetReadinessHTTPClient()
	assert.NotNil(t, client)
}

func TestRoot_GetReadinessGrpcClient(t *testing.T) {
	r := Root{
		Target: Target{
			GrpcHost:                "localhost",
			ReadinessPort:           50051,
			Insecure:                false,
			GrpcTimeoutMilliseconds: 1000,
		},
	}
	client := r.GetReadinessGrpcClient()
	assert.NotNil(t, client)
}

func TestRoot_GetHTTPClient(t *testing.T) {
	r := Root{
		Target: Target{
			HTTPHost:                "http://localhost",
			HTTPPort:                8080,
			Insecure:                false,
			HTTPTimeoutMilliseconds: 10000,
			HTTPProtocol:            "http1",
		},
	}
	client := r.GetHTTPClient()
	assert.NotNil(t, client)
}

func TestRoot_GetGrpcClient(t *testing.T) {
	r := Root{
		Target: Target{
			GrpcHost:                "localhost",
			GrpcPort:                50051,
			Insecure:                false,
			GrpcTimeoutMilliseconds: 1000,
		},
	}
	client := r.GetGrpcClient()
	assert.NotNil(t, client)
}

func TestRoot_GetWarmupTargetOptions_HTTP(t *testing.T) {
	r := Root{
		Target: Target{
			ReadinessProtocol:   "http",
			ReadinessHTTPPath:   "/ready",
			ReadinessGrpcMethod: "grpc.health.v1.Health/Check",
			ReadinessPort:       8080,
		},
	}
	options, err := r.GetWarmupTargetOptions()
	require.NoError(t, err)
	assert.Equal(t, "http", options.ReadinessProtocol)
	assert.Equal(t, "/ready", options.ReadinessHTTPPath)
}

func TestRoot_GetWarmupTargetOptions_GRPC(t *testing.T) {
	r := Root{
		Target: Target{
			ReadinessProtocol:   "grpc",
			ReadinessHTTPPath:   "/ready",
			ReadinessGrpcMethod: "grpc.health.v1.Health/Check",
			ReadinessPort:       50051,
		},
	}
	options, err := r.GetWarmupTargetOptions()
	require.NoError(t, err)
	assert.Equal(t, "grpc", options.ReadinessProtocol)
}

func TestRoot_GetWarmupTargetOptions_InvalidProtocol(t *testing.T) {
	r := Root{
		Target: Target{
			ReadinessProtocol: "invalid",
		},
	}
	_, err := r.GetWarmupTargetOptions()
	require.Error(t, err)
	assert.Contains(t, err.Error(), "readiness protocol invalid not supported")
}

func TestRoot_GetWarmupHTTPHeaders(t *testing.T) {
	r := Root{
		HTTPHeaders: HTTPHeaders{
			Headers: stringArray{"Content-Type: application/json", "X-Custom: value"},
		},
	}
	headers := r.GetWarmupHTTPHeaders()
	assert.Equal(t, 2, len(headers))
	assert.Equal(t, "Content-Type: application/json", headers[0])
}

func TestRoot_GetWarmupHTTPRequests(t *testing.T) {
	r := Root{
		HTTP: HTTP{
			Requests:    stringArray{"get:/health", "post:/ping"},
			Compression: "",
		},
	}
	requests, err := r.GetWarmupHTTPRequests()
	require.NoError(t, err)
	assert.Equal(t, 2, len(requests))
	assert.Equal(t, "/health", requests[0].Path)
}

func TestRoot_GetWarmupHTTPRequests_Error(t *testing.T) {
	r := Root{
		HTTP: HTTP{
			Requests:    stringArray{"invalid"},
			Compression: "",
		},
	}
	_, err := r.GetWarmupHTTPRequests()
	require.Error(t, err)
}

func TestRoot_GetWarmupGrpcRequests(t *testing.T) {
	r := Root{
		Grpc: Grpc{
			Requests: stringArray{"svc1/ping", "svc2/method"},
		},
	}
	requests, err := r.GetWarmupGrpcRequests()
	require.NoError(t, err)
	assert.Equal(t, 2, len(requests))
	assert.Equal(t, "svc1/ping", requests[0].ServiceMethod)
}

func TestRoot_GetWarmupGrpcRequests_Empty(t *testing.T) {
	r := Root{}
	requests, err := r.GetWarmupGrpcRequests()
	require.NoError(t, err)
	assert.Equal(t, 0, len(requests))
}

/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

'use strict';

var hasWebAssemblySupport = require( '@stdlib/assert-has-wasm-support' );
var Memory = require( '@stdlib/wasm-memory' );
var discreteUniform = require( '@stdlib/random-base-discrete-uniform' ).factory;
var gfillBy = require( '@stdlib/blas-ext-base-gfill-by' );
var bytesPerElement = require( '@stdlib/ndarray-base-bytes-per-element' );
var Float32ArrayLE = require( '@stdlib/array-little-endian-float32' );
var cscal = require( './../lib' );

function main() {
	if ( !hasWebAssemblySupport() ) {
		console.error( 'Environment does not support WebAssembly.' );
		return;
	}
	// Create a new memory instance with an initial size of 10 pages (640KiB) and a maximum size of 100 pages (6.4MiB):
	var mem = new Memory({
		'initial': 10,
		'maximum': 100
	});

	// Create a BLAS routine:
	var mod = new cscal.Module( mem );
	// returns <Module>

	// Initialize the routine:
	mod.initializeSync(); // eslint-disable-line node/no-sync

	// Specify a vector length:
	var N = 5;

	// Define a pointer (i.e., byte offset) for storing the input vector:
	var xptr = 0;

	// Define a pointer for storing a complex number:
	var zptr = N * bytesPerElement( 'complex64' );

	// Create typed array views over module memory:
	var x = new Float32ArrayLE( mod.memory.buffer, xptr, N*2 );
	var z = new Float32ArrayLE( mod.memory.buffer, zptr, 2 );

	// Write values to module memory:
	gfillBy( N*2, x, 1, discreteUniform( -10.0, 10.0 ) );
	gfillBy( 2, z, 1, discreteUniform( -10.0, 10.0 ) );

	// Perform computation:
	mod.ndarray( N, zptr, xptr, 1, 0 );

	// Print the result:
	console.log( 'x[:] = [%s]', x.toString() );
}

main();
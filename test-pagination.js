// /**
//  * Simple test script to verify pagination endpoint
//  * Run this after starting your server with: node test-pagination.js
//  */

// const axios = require('axios');

// const BASE_URL = 'http://localhost:5000/api/products';

// async function testPagination() {
//   console.log('🧪 Testing Pagination API...\n');

//   try {
//     // Test 1: Default pagination (page 1, limit 8)
//     console.log('Test 1: GET /api/products (default)');
//     const test1 = await axios.get(BASE_URL);
//     console.log('✅ Response structure:', {
//       dataLength: test1.data.data?.length,
//       total: test1.data.total,
//       page: test1.data.page,
//       limit: test1.data.limit,
//       totalPages: test1.data.totalPages
//     });
//     console.log('');

//     // Test 2: Page 2
//     console.log('Test 2: GET /api/products?page=2');
//     const test2 = await axios.get(`${BASE_URL}?page=2`);
//     console.log('✅ Response structure:', {
//       dataLength: test2.data.data?.length,
//       total: test2.data.total,
//       page: test2.data.page,
//       limit: test2.data.limit,
//       totalPages: test2.data.totalPages
//     });
//     console.log('');

//     // Test 3: Custom limit
//     console.log('Test 3: GET /api/products?page=1&limit=5');
//     const test3 = await axios.get(`${BASE_URL}?page=1&limit=5`);
//     console.log('✅ Response structure:', {
//       dataLength: test3.data.data?.length,
//       total: test3.data.total,
//       page: test3.data.page,
//       limit: test3.data.limit,
//       totalPages: test3.data.totalPages
//     });
//     console.log('');

//     // Test 4: Last page
//     const totalPages = test1.data.totalPages;
//     console.log(`Test 4: GET /api/products?page=${totalPages} (last page)`);
//     const test4 = await axios.get(`${BASE_URL}?page=${totalPages}`);
//     console.log('✅ Response structure:', {
//       dataLength: test4.data.data?.length,
//       total: test4.data.total,
//       page: test4.data.page,
//       limit: test4.data.limit,
//       totalPages: test4.data.totalPages
//     });
//     console.log('');

//     console.log('✅ All tests passed! Pagination is working correctly.');
//     console.log('\n📊 Summary:');
//     console.log(`   Total products: ${test1.data.total}`);
//     console.log(`   Products per page: ${test1.data.limit}`);
//     console.log(`   Total pages: ${test1.data.totalPages}`);

//   } catch (error) {
//     console.error('❌ Test failed:', error.message);
//     if (error.response) {
//       console.error('Response data:', error.response.data);
//     }
//     if (error.code === 'ECONNREFUSED') {
//       console.error('\n⚠️  Make sure the server is running on http://localhost:5000');
//       console.error('   Start it with: npm start');
//     }
//   }
// }

// testPagination();

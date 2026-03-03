
const axios = require('axios');

const FormData = require('form-data');

async function testUpload() {
    const url = 'http://localhost:3000/api/attachments?groupKey=test_group_123';
    const fd = new FormData();
    fd.append('requestPhaseLookupId', '25');
    // Create a dummy file stream
    const buffer = Buffer.from('test dummy file content');
    fd.append('files', buffer, { filename: 'test.txt', contentType: 'text/plain' });

    try {
        console.log('Sending test upload request to:', url);
        const res = await axios.post(url, fd, {
            headers: fd.getHeaders()
        });
        console.log('Success:', res.data);
    } catch (err) {
        console.error('Failed with status:', err.response?.status);
        console.error('Response data:', JSON.stringify(err.response?.data, null, 2));
    }
}

testUpload();

let mocha = require('mocha'),
    fetch = require('node-fetch'),
    ApiClient = require('../lib/client').default;

describe('Quick test', () => {
    let client = new ApiClient({
        endpoint: 'https://api.vk.com/method/',
        extraParams: {v: '5.73'},
        fetch: fetch,
    });

    it('get pashka from vk', (done) => {
        client.call('users.get', {user_ids: 1}, (err, res) => {
            if(err){
                done(err);
            }else{
                if(!res || !res.length || !res[0].id === 1){
                    done("bad response");
                }else{
                    console.log(res);
                    done();
                }
            }
        });
    });
});
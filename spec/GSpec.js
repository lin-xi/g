/*globals Player:false, Song: false*/

describe("G", function() {

    beforeEach(function() {
    });

    describe("G.extend", function() {

        it("basic extend", function() {
            var obj = G.extend({a:1}, {b:'string'});
            expect(obj.a).toBe(1);
            expect(obj.b).toBe('string');
        });

     
    });
    
});
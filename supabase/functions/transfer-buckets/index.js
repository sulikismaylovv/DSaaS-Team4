// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
console.log("Hello from Functions!");
// Deno.serve(async (req) => {
// npm install @supabase/supabase-js@1
var createClient = require('@supabase/supabase-js').createClient;
console.log("Hello from Functions!");
var OLD_PROJECT_URL = 'https://kvjhoifmabxitkelfeod.supabase.co';
var OLD_PROJECT_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2amhvaWZtYWJ4aXRrZWxmZW9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5NzEzNDc0MywiZXhwIjoyMDEyNzEwNzQzfQ.E7YyyKG0NUWAyk0mmaVUhPd4PeDW2QqNqeX3YtFP6XQ';
var NEW_PROJECT_URL = 'https://exspobkugyipwqkqoavo.supabase.co';
var NEW_PROJECT_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c3BvYmt1Z3lpcHdxa3FvYXZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMjMwNDU1MywiZXhwIjoyMDE3ODgwNTUzfQ.naiRatAl8zh98kl5spT11srWhnnK7sz1fOpZY0m-Q14';
await(function () { return __awaiter(_this, void 0, void 0, function () {
    var oldSupabaseRestClient, oldSupabaseClient, newSupabaseClient, _a, oldObjects, error, _i, oldObjects_1, objectData, _b, data, downloadObjectError, _c, _1, uploadObjectError, err_1;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                oldSupabaseRestClient = createClient(OLD_PROJECT_URL, OLD_PROJECT_SERVICE_KEY, {
                    db: {
                        schema: 'storage',
                    },
                });
                console.log(oldSupabaseRestClient);
                oldSupabaseClient = createClient(OLD_PROJECT_URL, OLD_PROJECT_SERVICE_KEY);
                newSupabaseClient = createClient(NEW_PROJECT_URL, NEW_PROJECT_SERVICE_KEY);
                return [4 /*yield*/, oldSupabaseRestClient.from('objects').select()];
            case 1:
                _a = _d.sent(), oldObjects = _a.data, error = _a.error;
                console.log(oldObjects);
                if (error) {
                    console.log('error getting objects from old bucket');
                    throw error;
                }
                _i = 0, oldObjects_1 = oldObjects;
                _d.label = 2;
            case 2:
                if (!(_i < oldObjects_1.length)) return [3 /*break*/, 8];
                objectData = oldObjects_1[_i];
                console.log("moving ".concat(objectData.id));
                _d.label = 3;
            case 3:
                _d.trys.push([3, 6, , 7]);
                return [4 /*yield*/, oldSupabaseClient.storage
                        .from(objectData.bucket_id)
                        .download(objectData.name)];
            case 4:
                _b = _d.sent(), data = _b.data, downloadObjectError = _b.error;
                if (downloadObjectError) {
                    throw downloadObjectError;
                }
                return [4 /*yield*/, newSupabaseClient.storage
                        .from(objectData.bucket_id)
                        .upload(objectData.name, data, {
                        upsert: true,
                        contentType: objectData.metadata.mimetype,
                        cacheControl: objectData.metadata.cacheControl,
                    })];
            case 5:
                _c = _d.sent(), _1 = _c._, uploadObjectError = _c.error;
                if (uploadObjectError) {
                    throw uploadObjectError;
                }
                return [3 /*break*/, 7];
            case 6:
                err_1 = _d.sent();
                console.log('error moving ', objectData);
                console.log(err_1);
                return [3 /*break*/, 7];
            case 7:
                _i++;
                return [3 /*break*/, 2];
            case 8: return [2 /*return*/];
        }
    });
}); })();
//   return new Response(
//     JSON.stringify(data),
//     { headers: { "Content-Type": "application/json" } },
//   )
// })
/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/transfer-buckets' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

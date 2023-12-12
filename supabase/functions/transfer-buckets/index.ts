// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

console.log("Hello from Functions!")


// Deno.serve(async (req) => {
// npm install @supabase/supabase-js@1
const {createClient} = require('@supabase/supabase-js')
console.log("Hello from Functions!")

const OLD_PROJECT_URL = 'https://kvjhoifmabxitkelfeod.supabase.co'
const OLD_PROJECT_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2amhvaWZtYWJ4aXRrZWxmZW9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5NzEzNDc0MywiZXhwIjoyMDEyNzEwNzQzfQ.E7YyyKG0NUWAyk0mmaVUhPd4PeDW2QqNqeX3YtFP6XQ'
const NEW_PROJECT_URL = 'https://exspobkugyipwqkqoavo.supabase.co'
const NEW_PROJECT_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c3BvYmt1Z3lpcHdxa3FvYXZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMjMwNDU1MywiZXhwIjoyMDE3ODgwNTUzfQ.naiRatAl8zh98kl5spT11srWhnnK7sz1fOpZY0m-Q14'
;await (async () => {
    const oldSupabaseRestClient = createClient(OLD_PROJECT_URL, OLD_PROJECT_SERVICE_KEY, {
        db: {
            schema: 'storage',
        },
    })
    console.log(oldSupabaseRestClient);
    const oldSupabaseClient = createClient(OLD_PROJECT_URL, OLD_PROJECT_SERVICE_KEY)
    const newSupabaseClient = createClient(NEW_PROJECT_URL, NEW_PROJECT_SERVICE_KEY)

    // make sure you update max_rows in postgrest settings if you have a lot of objects
    // or paginate here
    const {data: oldObjects, error} = await oldSupabaseRestClient.from('objects').select()
    console.log(oldObjects);
    if (error) {
        console.log('error getting objects from old bucket')
        throw error
    }

    for (const objectData of oldObjects) {
        console.log(`moving ${objectData.id}`)
        try {
            const {data, error: downloadObjectError} = await oldSupabaseClient.storage
                .from(objectData.bucket_id)
                .download(objectData.name)
            if (downloadObjectError) {
                throw downloadObjectError
            }

            const {_, error: uploadObjectError} = await newSupabaseClient.storage
                .from(objectData.bucket_id)
                .upload(objectData.name, data, {
                    upsert: true,
                    contentType: objectData.metadata.mimetype,
                    cacheControl: objectData.metadata.cacheControl,
                })
            if (uploadObjectError) {
                throw uploadObjectError
            }
        } catch (err) {
            console.log('error moving ', objectData)
            console.log(err)
        }
    }
})()


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

// generate-manifest.js
// Run this locally from your project's ROOT folder with:
//   node songs/generate-manifest.js
// Every time you add/remove songs or albums, run it again, then commit + push.

const fs = require('fs');
const path = require('path');

const songsDir = __dirname;
const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'];

if (!fs.existsSync(songsDir)) {
    console.error('Could not find a "songs" folder next to this script. Run it from your project root.');
    process.exit(1);
}

const albums = [];

fs.readdirSync(songsDir, { withFileTypes: true }).forEach((entry) => {
    if (entry.isDirectory()) {
        const folderPath = path.join(songsDir, entry.name);
        const files = fs.readdirSync(folderPath);
        const songFiles = files.filter((f) =>
            audioExtensions.includes(path.extname(f).toLowerCase())
        );

        // Write songs.json inside this album folder, e.g. songs/ncs/songs.json
        fs.writeFileSync(
            path.join(folderPath, 'songs.json'),
            JSON.stringify(songFiles, null, 2)
        );
        console.log(`songs/${entry.name}/songs.json  ->  ${songFiles.length} songs`);

        albums.push(entry.name);
    }
});

// Write the master album list, e.g. songs/albums.json
fs.writeFileSync(
    path.join(songsDir, 'albums.json'),
    JSON.stringify(albums, null, 2)
);
console.log(`songs/albums.json  ->  ${albums.length} albums`);
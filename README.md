# Guitar tuner

It's a tuner based on web audio api which can work in three modes:
- 'All notes' - tuner automatically understands what note user is trying to tune by its sound. (supports any notes including flat and sharp ones)
- 'Standard auto' - tuner automatically understands what note user is trying to tune by its sound. (supports only standard tuning)
- 'Standard strict' - user can choose one guitar string and tune it individually. (supports only standard tuning)

## For what stands each file?

- **tuner.js** is the main part of the program.
- **app.js** connects tuner and UI.
- *meter.js, note.js, index.html, style.css* - UI.

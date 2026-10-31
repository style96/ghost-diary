# Temporary voice assets. Run on Windows with System.Speech and Python 3.
# Only the committed fictional demo sentences are read. No network is used.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$ghostRoot = Split-Path -Parent $PSScriptRoot
$ghostRaw = Join-Path $ghostRoot 'artifacts/ghost-voice-source'
New-Item -ItemType Directory -Force -Path $ghostRaw | Out-Null
$ghostSamples = Get-Content -LiteralPath (Join-Path $ghostRoot 'src/demo/recorded.json') -Raw | ConvertFrom-Json
$ghostSpeech = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
    $ghostSpeech.Rate = -1
    $ghostSpeech.Volume = 90
    $ghostFormat = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(22050, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
    foreach ($ghostSample in $ghostSamples) {
        $ghostSpeech.SetOutputToWaveFile((Join-Path $ghostRaw ($ghostSample.id + '.wav')), $ghostFormat)
        $ghostSpeech.Speak(($ghostSample.haunting.edits | ForEach-Object { $_.text }) -join ' ')
        $ghostSpeech.SetOutputToNull()
    }
} finally { $ghostSpeech.Dispose() }
python (Join-Path $PSScriptRoot 'process-ghost-voices.py')
if ($LASTEXITCODE -ne 0) { throw 'Audio processing failed.' }

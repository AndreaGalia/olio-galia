# Script per testare WhatsApp
$phoneNumber = "3661368797"  # Cambia con il numero destinatario del test

Write-Host "=== TEST WHATSAPP ===" -ForegroundColor Cyan
Write-Host ""

# Prima verifica la configurazione
Write-Host "1. Verifico configurazione..." -ForegroundColor Yellow
try {
    $configResponse = Invoke-RestMethod -Uri "http://172.20.0.1:3000/api/test-whatsapp" -Method GET

    Write-Host "   Provider: $($configResponse.status.provider)" -ForegroundColor White
    Write-Host "   Configurato: $($configResponse.status.isConfigured)" -ForegroundColor White
    Write-Host "   Abilitato: $($configResponse.status.isEnabled)" -ForegroundColor White

    if ($configResponse.status.provider -eq "twilio") {
        Write-Host "   [Twilio] Account SID: $($configResponse.status.twilio.hasAccountSid)" -ForegroundColor White
        Write-Host "   [Twilio] Auth Token: $($configResponse.status.twilio.hasAuthToken)" -ForegroundColor White
        Write-Host "   [Twilio] WhatsApp Number: $($configResponse.status.twilio.hasWhatsAppNumber)" -ForegroundColor White
    } else {
        Write-Host "   [Meta] Phone Number ID: $($configResponse.status.meta.hasPhoneNumberId)" -ForegroundColor White
        Write-Host "   [Meta] Access Token: $($configResponse.status.meta.hasAccessToken)" -ForegroundColor White
        Write-Host "   [Meta] API Version: $($configResponse.status.meta.apiVersion)" -ForegroundColor White
    }

    Write-Host ""
} catch {
    Write-Host "   ❌ Errore nella verifica configurazione" -ForegroundColor Red
    Write-Host ""
}

# Poi prova a inviare il messaggio
Write-Host "2. Invio messaggio di test a: $phoneNumber" -ForegroundColor Yellow

$body = @{
    phoneNumber = $phoneNumber
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://172.20.0.1:3000/api/test-whatsapp" -Method POST -ContentType "application/json" -Body $body

    Write-Host "`nRisposta:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10 | Write-Host

    if ($response.success) {
        Write-Host "`n✅ SUCCESSO! Messaggio inviato!" -ForegroundColor Green
        Write-Host "   Message ID: $($response.messageId)" -ForegroundColor White
        Write-Host "`n   Controlla WhatsApp sul numero $phoneNumber" -ForegroundColor Cyan
    } else {
        Write-Host "`n❌ ERRORE: $($response.error)" -ForegroundColor Red
        Write-Host "   Codice errore: $($response.errorCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "`n❌ ERRORE nella chiamata API:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

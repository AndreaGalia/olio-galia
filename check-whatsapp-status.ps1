# Script per verificare lo stato del numero WhatsApp Business
$phoneNumberId = "797468110127867"
$accessToken = (Get-Content .env.local | Select-String "META_WHATSAPP_ACCESS_TOKEN=").ToString().Split('=')[1]
$apiVersion = "v21.0"

Write-Host "Verifico stato numero WhatsApp Business..." -ForegroundColor Yellow
Write-Host "Phone Number ID: $phoneNumberId`n" -ForegroundColor Cyan

try {
    # Verifica info numero
    $uri = "https://graph.facebook.com/$apiVersion/$phoneNumberId`?fields=verified_name,code_verification_status,display_phone_number,quality_rating,messaging_limit_tier,account_mode"
    $headers = @{
        "Authorization" = "Bearer $accessToken"
    }

    $response = Invoke-RestMethod -Uri $uri -Method GET -Headers $headers

    Write-Host "=== STATO NUMERO WHATSAPP BUSINESS ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Display Phone Number: $($response.display_phone_number)" -ForegroundColor White
    Write-Host "Verified Name: $($response.verified_name)" -ForegroundColor White
    Write-Host "Quality Rating: $($response.quality_rating)" -ForegroundColor $(if ($response.quality_rating -eq "GREEN") { "Green" } else { "Yellow" })
    Write-Host "Messaging Limit Tier: $($response.messaging_limit_tier)" -ForegroundColor White
    Write-Host "Account Mode: $($response.account_mode)" -ForegroundColor White
    Write-Host "Code Verification Status: $($response.code_verification_status)" -ForegroundColor White
    Write-Host ""

    # Analisi problemi
    Write-Host "=== ANALISI ===" -ForegroundColor Cyan

    if ($response.quality_rating -ne "GREEN") {
        Write-Host "⚠️  Quality Rating non è GREEN - potrebbe causare limitazioni" -ForegroundColor Yellow
    }

    if ($response.messaging_limit_tier -eq "TIER_NOT_SET" -or $response.messaging_limit_tier -eq "TIER_0") {
        Write-Host "⚠️  Messaging Limit Tier basso - potresti non poter inviare messaggi" -ForegroundColor Yellow
        Write-Host "   Soluzione: Verifica il numero nella dashboard Meta" -ForegroundColor Yellow
    }

    if ($response.account_mode -eq "SANDBOX") {
        Write-Host "⚠️  Account in modalità SANDBOX - puoi inviare solo a numeri test!" -ForegroundColor Red
        Write-Host "   Soluzione: Completa la verifica business nella dashboard" -ForegroundColor Yellow
    }

    if ($response.code_verification_status -ne "VERIFIED") {
        Write-Host "⚠️  Numero non completamente verificato" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "Risposta completa:" -ForegroundColor Gray
    $response | ConvertTo-Json -Depth 10 | Write-Host

} catch {
    Write-Host "❌ ERRORE nella verifica:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red

    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Dettagli errore:" -ForegroundColor Red
        Write-Host $responseBody -ForegroundColor Red
    }
}

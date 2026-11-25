$secret = Get-Content "$env:TEMP\aeon-jwt.txt"
$services = "auth-service","catalog-service","projects-service","gateway"
foreach ($s in $services) {
  $cmd = "`$env:Path += ';C:\tools\apache-maven-3.9.9\bin'; `$env:AUTH_JWT_SECRET='$secret'; `$env:MYSQL_USER='formflora'; `$env:MYSQL_PASSWORD='formflora_dev'; cd D:\persona\aeon\backend; mvn -pl $s spring-boot:run"
  Start-Process powershell -ArgumentList "-NoExit","-Command",$cmd
  Start-Sleep -Seconds 20
}
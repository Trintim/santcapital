<x-mail::message>
# Bem-vindo(a), {{ $name }}!

Sua conta de **funcionário** foi criada.

**E-mail:** {{ $email }}<br>
**Senha temporária:** `{{ $plainPassword }}`

Acesse o sistema com as credenciais acima e, em seguida, **altere sua senha**.

<x-mail::button :url="$loginUrl">
Entrar no painel
</x-mail::button>

Qualquer dúvida, fale com o administrador.

{{ config('app.name') }}
</x-mail::message>

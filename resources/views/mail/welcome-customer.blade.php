<x-mail::message>
# Olá, {{ $name }}!

Sua conta foi efetivada.

**E-mail:** {{ $email }}<br>
**Senha temporária:** `{{ $password }}`

Por segurança, recomendamos trocar a senha no primeiro acesso.

<x-mail::button :url="$loginUrl">
Acessar o sistema
</x-mail::button>

Se você não solicitou este cadastro, ignore este e-mail.

Obrigado,<br>
{{ config('app.name') }}
</x-mail::message>

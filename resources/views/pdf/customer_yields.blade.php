<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Relatório de Rendimentos Mensais</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background: #f5f5f5; }
    </style>
</head>
<body>
    <h2>Relatório de Rendimentos Mensais</h2>
    <p>Cliente: <strong>{{ $user->name }}</strong> ({{ $user->email }})</p>
    <table>
        <thead>
            <tr>
                <th>Período</th>
                <th>Plano</th>
                <th>Rendimento (%)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($yields as $yield)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($yield->period)->format('m/Y') }}</td>
                    <td>{{ $yield->investment_plan_id }}</td>
                    <td>{{ number_format((float)$yield->percent_decimal, 2, ',', '.') }}%</td>
                </tr>
            @empty
                <tr>
                    <td colspan="3">Nenhum rendimento registrado para os períodos selecionados.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
    <p>Períodos exibidos: mês atual, mês anterior e mesmo mês do ano anterior.</p>
</body>
</html>

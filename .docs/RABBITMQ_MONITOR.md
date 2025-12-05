# 🐰 Monitorar RabbitMQ no CloudAMQP

## 🌐 Acesso Web (Recomendado)

### 1. Painel CloudAMQP
1. Acesse: https://customer.cloudamqp.com/
2. Faça login
3. Clique na sua instância
4. Veja estatísticas e métricas

### 2. RabbitMQ Management Interface
```
URL: https://seal.lmq.cloudamqp.com/
Username: nxvsxxff
Password: fD6KwgZCD7jTfDZkx4UNxsq3UUdX3dH4
```

---

## 📋 O que Monitorar

### Queues (Filas)
- **Nome**: `weather-data`
- **Messages Ready**: Mensagens aguardando processamento
- **Messages Unacked**: Mensagens sendo processadas
- **Publish Rate**: Taxa de publicação
- **Delivery Rate**: Taxa de consumo

### Connections (Conexões)
- **Collector** - Publica mensagens
- **Worker** - Consome mensagens

### Channels (Canais)
- Ver quantos canais estão ativos
- Identificar problemas de conexão

---

## 🔍 Ver Mensagens na Fila

1. Vá em **Queues** → Clique em `weather-data`
2. Role até **"Get messages"**
3. Configure:
   - **Messages**: 10
   - **Ackmode**: `Nack message requeue true` (não remove da fila)
4. Clique em **"Get Message(s)"**

Você verá o payload JSON das mensagens.

---

## 📊 Estatísticas Importantes

### Indicadores de Saúde:

✅ **Bom**:
- Messages Ready < 100
- Delivery Rate ≈ Publish Rate
- No connection errors

⚠️ **Atenção**:
- Messages Ready crescendo constantemente
- Delivery Rate < Publish Rate
- Connections/Channels fechando e abrindo constantemente

❌ **Problema**:
- Messages Ready > 1000
- Delivery Rate = 0 (worker não está consumindo)
- Connection errors frequentes

---

## 🛠️ Troubleshooting

### Worker não está consumindo:
```bash
# Verificar se Worker está rodando
# Railway → Worker service → Logs

# Verificar variáveis de ambiente
RABBITMQ_URI=amqps://nxvsxxff:fD6KwgZCD7jTfDZkx4UNxsq3UUdX3dH4@seal.lmq.cloudamqp.com/nxvsxxff
RABBITMQ_QUEUE=weather-data
```

### Collector não está publicando:
```bash
# Verificar se Collector está rodando
# Railway → Collector service → Logs

# Verificar variáveis de ambiente
RABBITMQ_URI=amqps://nxvsxxff:fD6KwgZCD7jTfDZkx4UNxsq3UUdX3dH4@seal.lmq.cloudamqp.com/nxvsxxff
RABBITMQ_QUEUE=weather-data
```

### Mensagens acumulando:
- Worker pode estar lento
- Worker pode estar com erro ao processar
- API pode estar fora do ar

---

## 🐍 Script Python para Monitorar

Se quiser monitorar via código:

```python
import pika
import json

# Conectar
credentials = pika.PlainCredentials('nxvsxxff', 'fD6KwgZCD7jTfDZkx4UNxsq3UUdX3dH4')
parameters = pika.ConnectionParameters(
    host='seal.lmq.cloudamqp.com',
    port=5671,
    virtual_host='nxvsxxff',
    credentials=credentials,
    ssl_options=pika.SSLOptions()
)

connection = pika.BlockingConnection(parameters)
channel = connection.channel()

# Declarar fila
channel.queue_declare(queue='weather-data', durable=True)

# Consumir UMA mensagem (sem remover)
method, properties, body = channel.basic_get(queue='weather-data', auto_ack=False)

if method:
    print(f"Mensagem encontrada:")
    print(json.loads(body))
    # Rejeitar sem remover (volta para fila)
    channel.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
else:
    print("Fila vazia")

connection.close()
```

---

## 🔗 Links Úteis

- **CloudAMQP Dashboard**: https://customer.cloudamqp.com/
- **RabbitMQ Manager**: https://seal.lmq.cloudamqp.com/
- **CloudAMQP Docs**: https://www.cloudamqp.com/docs/index.html
- **RabbitMQ Tutorials**: https://www.rabbitmq.com/getstarted.html

---

## 📈 Métricas Esperadas

### Fluxo Normal:

```
Collector (Python)
    ↓ Publica a cada 1 hora (3600s)
RabbitMQ Queue (weather-data)
    ↓ Consome imediatamente
Worker (Go)
    ↓ Envia para API
Backend (NestJS)
    ↓ Salva no MongoDB
```

**Taxa esperada**: 
- 1 mensagem a cada 3600 segundos (1 hora)
- Se tiver 2 localizações: 2 mensagens/hora
- Fila deve estar vazia na maioria do tempo

---

## 🚨 Alertas

Configure alertas no CloudAMQP para:
- Fila com mais de 100 mensagens
- Connection errors
- Disk/Memory usage alto


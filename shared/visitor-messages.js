export function visitorMessages(messages = []) {
  return messages.filter(message => /^(visitor|user|customer)$/i.test(String(message.sender || '')));
}

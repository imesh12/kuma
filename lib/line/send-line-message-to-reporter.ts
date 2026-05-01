export async function sendLineMessageToReporter(lineUserId: string, message: string) {
  console.info('sendLineMessageToReporter stub', {
    lineUserId,
    message,
  });

  return {
    ok: true,
    provider: 'stub',
    lineUserId,
    message,
    sentAt: new Date(),
  };
}

import {
  AdminRole,
  DangerLevel,
  FollowUpStatus,
  PrismaClient,
  ReportStatus,
  ReportType,
  ReporterContactStatus,
  SourceType,
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import { maskLineUserId } from '@/lib/reporting';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.trustEvent.deleteMany();
  await prisma.alertRecipient.deleteMany();
  await prisma.privateMessage.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.bearReport.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('admin1234', 10);
  const admin = await prisma.admin.create({
    data: {
      name: 'Super Admin',
      email: 'admin@kuma.local',
      passwordHash,
      role: AdminRole.SUPER_ADMIN,
    },
  });

  const user1 = await prisma.user.create({
    data: {
      lineUserId: 'U8f3a614d0d4a92d1',
      maskedLineUserId: maskLineUserId('U8f3a614d0d4a92d1'),
      displayName: '山田 太郎',
      trustScore: 18,
      trustLevel: 10,
      approvedReportCount: 3,
      registeredLat: 43.0642,
      registeredLng: 141.3469,
      contactConsent: true,
      contactStatus: ReporterContactStatus.CONTACTABLE,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      lineUserId: 'U6f0b223ad0ce44b2',
      maskedLineUserId: maskLineUserId('U6f0b223ad0ce44b2'),
      displayName: '佐藤 花子',
      trustScore: 6,
      trustLevel: 5,
      registeredLat: 43.0618,
      registeredLng: 141.3545,
      contactConsent: false,
      contactStatus: ReporterContactStatus.NO_CONSENT,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      lineUserId: 'Uf09a12dd0f6f3419',
      maskedLineUserId: maskLineUserId('Uf09a12dd0f6f3419'),
      displayName: '鈴木 次郎',
      registeredLat: 43.075,
      registeredLng: 141.36,
      contactConsent: true,
      contactStatus: ReporterContactStatus.CONTACTABLE,
    },
  });

  await prisma.bearReport.create({
    data: {
      userId: user1.id,
      reporterId: user1.id,
      type: ReportType.BEAR_SEEN,
      sourceType: SourceType.LINE,
      title: '住宅街近くでクマを目撃',
      description: '夕方に道路横断を確認。近くに通学路があり注意が必要です。',
      memo: '黒っぽい個体が1頭。',
      prefecture: '北海道',
      municipality: '札幌市',
      address: '南区藤野付近',
      realLat: 43.0642,
      realLng: 141.3469,
      publicLat: 43.065,
      publicLng: 141.348,
      status: ReportStatus.APPROVED,
      dangerLevel: DangerLevel.LEVEL_3,
      sightedAt: new Date(),
      reporterContactAllowed: true,
      followUpStatus: FollowUpStatus.NEEDS_CONTACT,
      approvedAt: new Date(),
      approvedByAdminId: admin.id,
    },
  });

  await prisma.bearReport.create({
    data: {
      userId: user2.id,
      reporterId: user2.id,
      type: ReportType.FOOTPRINT,
      sourceType: SourceType.WEB,
      title: '河川敷で大きな足跡',
      description: '泥地に新しい足跡を確認。周辺住民から不安の声があります。',
      prefecture: '北海道',
      municipality: '札幌市',
      address: '豊平川沿い',
      realLat: 43.0618,
      realLng: 141.3545,
      publicLat: 43.0624,
      publicLng: 141.3551,
      status: ReportStatus.CHECKING,
      dangerLevel: DangerLevel.LEVEL_2,
      sightedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      reporterContactAllowed: false,
      followUpStatus: FollowUpStatus.NOT_NEEDED,
    },
  });

  await prisma.bearReport.create({
    data: {
      userId: user3.id,
      reporterId: user3.id,
      type: ReportType.SCHOOL_OR_HOUSE_NEARBY,
      sourceType: SourceType.POLICE,
      title: '小学校付近でごみ荒らし',
      description: '早朝に学校裏手の集積所が荒らされていました。通学時間帯の警戒が必要です。',
      prefecture: '北海道',
      municipality: '札幌市',
      address: '北区あいの里',
      realLat: 43.075,
      realLng: 141.36,
      publicLat: 43.0757,
      publicLng: 141.3614,
      status: ReportStatus.DANGEROUS,
      dangerLevel: DangerLevel.LEVEL_4,
      sightedAt: new Date(Date.now() - 90 * 60 * 1000),
      reporterContactAllowed: true,
      followUpStatus: FollowUpStatus.MESSAGE_SENT,
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

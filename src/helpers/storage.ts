import { DataSource } from 'typeorm'
import { IdMapping } from '../entity/IdMapping'
import { Membership } from '../entity/Membership'
import { Entity, entities } from '../Entities'

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE || 'db.sqlite',
  entities: [IdMapping, Membership],
  synchronize: true,
  logging: false,
})

export async function initStorage(): Promise<void> {
  await AppDataSource.initialize()
}

export function getMapping(
  id: string,
  type: number
): Promise<IdMapping | null> {
  return AppDataSource.manager.findOneBy(IdMapping, {
    rcId: id,
    type: type,
  })
}

export async function save(entity: IdMapping | Membership): Promise<void> {
  await AppDataSource.manager.save(entity)
}

export async function getAccessToken(id: string): Promise<string | undefined> {
  return (await getMapping(id, entities[Entity.Users].mappingType))?.accessToken
}

export async function createMembership(
  rcRoomId: string,
  rcUserId: string
): Promise<void> {
  const membership = new Membership()
  membership.rcRoomId = rcRoomId
  membership.rcUserId = rcUserId

  await save(membership)
}

export async function getMemberships(rcRoomId: string): Promise<string[]> {
  return (
    await AppDataSource.manager.find(Membership, {
      select: {
        rcUserId: true,
      },
      where: {
        rcRoomId: rcRoomId,
      },
    })
  ).map((entity) => entity.rcUserId)
}

export async function getUserId(rcId: string): Promise<string | undefined> {
  return (await getMapping(rcId, entities[Entity.Users].mappingType))?.matrixId
}

export async function getRoomId(rcId: string): Promise<string | undefined> {
  return (await getMapping(rcId, entities[Entity.Rooms].mappingType))?.matrixId
}

export async function getMessageId(rcId: string): Promise<string | undefined> {
  return (await getMapping(rcId, entities[Entity.Messages].mappingType))
    ?.matrixId
}
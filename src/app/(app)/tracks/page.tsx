import { listMyCareerTracks } from "@/lib/actions/career-tracks"
import { AddCareerTrackDialog } from "@/components/career-tracks/add-career-track-dialog"
import { CareerTrackCard } from "@/components/career-tracks/career-track-card"

export default async function TracksPage() {
  const tracks = await listMyCareerTracks()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Career Tracks</h1>
          <p className="text-sm text-muted-foreground">
            1–3 целевых позиционирования с value proposition и списком компетенций.
          </p>
        </div>
        <AddCareerTrackDialog disabled={tracks.length >= 3} />
      </div>

      {tracks.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Треков пока нет. Начните с одного — например, целевой должности или типа проектной
          занятости.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {tracks.map((track) => (
            <CareerTrackCard key={track.id} careerTrack={track} />
          ))}
        </div>
      )}
    </div>
  )
}

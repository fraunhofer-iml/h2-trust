import { QualityDetailsEntity } from "../quality-details.entity";
import { HydrogenColor } from "@h2-trust/domain";

export const QualityDetailsEntityMock: QualityDetailsEntity[] = [
    new QualityDetailsEntity('quality-details-0', HydrogenColor.GREEN),
    new QualityDetailsEntity('quality-details-1', HydrogenColor.YELLOW),
    new QualityDetailsEntity('quality-details-2', HydrogenColor.MIX),
];

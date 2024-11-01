const ASSET_NAMES = [
  'cannonBallIcon.svg',
  'icon64.png',
  'grappleIcon.svg',
  'shipTexture.svg',
  'face.svg',
  'hair1.svg',
  'hair2.svg',
  'bib.svg',
  'hat.svg',
  'leftArm.svg',
  'leftLeg.svg',
  'leftShirt.svg',
  'rightArm.svg',
  'rightLeg.svg',
  'rightShirt.svg',
  'torso.svg',
  'wholePlayer.svg',
  'accelerator.svg',
  'acceleratorArrow.svg',
  'meteor.svg',
  'planet.svg',
];
//dictionary of the images
export const assets: { [key: string]: CanvasImageSource } = {};

export var downloadPromise: Promise<unknown>[];

export function createPromises() {
  downloadPromise = ASSET_NAMES.map(downloadAsset);
}
function downloadAsset(assetName: string) {
  return new Promise(resolve => {
    const asset = new Image();
    assets[assetName] = asset;
    asset.src = `./assets/${assetName}`;
    resolve("");
  });
}


export const getAsset = (assetName: string) => assets[assetName];

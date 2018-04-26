#! /usr/bin/env bash

set -e

help (){
  echo "Usage: $0 Arch[x86|x86_64|arm7]"
}

PRODUCT=myshare
FILESERVER=http://47.100.21.134:4880/myshare/3pp/

VERSION=

if [ -z $1 ]; then
  echo "Need correct args 1"
  help
  exit 1

elif ! [ "$1" = "x86_64" -o "$1" = "x86" -o "$1" = "arm7" ]; then
  echo "Need correct args 1"
  help
  exit 1
fi
ARCH=$1

NODE_VER=$(node -v)
if [ -z $NODE_VER ]; then
  echo "Need node > v6.9.x"
  exit 1
fi

TEMPDIR=/tmp/tmp3pp/$ARCH

get_version() {
  major="1.0.0"
  build=$(git rev-list --all|wc -l)
  head=$(git rev-list HEAD -n 1 | cut -c 1-7)
  VERSION=$major.$build.$head
}

get_3pp() {
  leveldown_url=$FILESERVER/$ARCH/leveldown.node
  secp256k1_url=$FILESERVER/$ARCH/secp256k1.node
  loader_url=$FILESERVER/$ARCH/loader

  mkdir -p $TEMPDIR

  if ! [ -f $TEMPDIR/leveldown.node ]; then
    wget $leveldown_url -P $TEMPDIR
  fi
  if ! [ -f $TEMPDIR/secp256k1.node ]; then
    wget $secp256k1_url -P $TEMPDIR
  fi
  if ! [ -f $TEMPDIR/loader ]; then
    wget $loader_url -P $TEMPDIR
    chmod +x $TEMPDIR/loader
  fi
}

mkdir -p ./release/$PRODUCT
rm -rf ./release/$PRODUCT/*
mkdir -p ./release/$PRODUCT/lib

echo "Current nodejs ($NODE_VER) ..."

get_version
echo "Building $PRODUCT ($VERSION) ..."

echo "Fetching 3pp ..."
get_3pp

echo "Installing dependencies ..."
echo "registry=https://registry.npm.taobao.org" > ~/.npmrc
npm install

echo "Compiling and Packaging for $ARCH arch ..."
npm run clean
npm run build

cp -f ./build/* ./release/$PRODUCT
cp -f $TEMPDIR/loader ./release/$PRODUCT
cp -f $TEMPDIR/leveldown.node ./release/$PRODUCT/lib
cp -f $TEMPDIR/secp256k1.node ./release/$PRODUCT/lib

OUTPUT=$PRODUCT-$VERSION-$ARCH.tar.gz

tar cfz $OUTPUT -C ./release ./$PRODUCT/

echo "$PRODUCT ($VERSION) package is available at $OUTPUT."


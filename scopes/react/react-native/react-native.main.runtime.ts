import { VariantPolicyConfigObject } from '@teambit/dependency-resolver';
import { merge } from 'lodash';
import { MainRuntime } from '@teambit/cli';
import { BuildTask } from '@teambit/builder';
import { Aspect } from '@teambit/harmony';
import { PackageJsonProps } from '@teambit/pkg';
import { EnvsAspect, EnvsMain, EnvTransformer, Environment } from '@teambit/envs';
import { ReactAspect, ReactMain } from '@teambit/react';
import { ReactNativeAspect } from './react-native.aspect';
// import { ReactNativeEnv } from './react-native.env';

const webpackConfig = require('./webpack/webpack.config');

// const jestConfig = require.resolve('./jest/jest.config');

export class ReactNativeMain {
  constructor(
    private react: ReactMain,

    readonly reactNativeEnv: Environment,

    private envs: EnvsMain
  ) {}

  icon() {
    return 'https://static.bit.dev/extensions-icons/nodejs.svg';
  }

  /**
   * override the TS config of the environment.
   */
  overrideTsConfig = this.react.overrideTsConfig.bind(this.react);

  /**
   * override the jest config of the environment.
   */
  overrideJestConfig = this.react.overrideJestConfig.bind(this.react);

  /**
   * override the env build pipeline.
   */
  overrideBuildPipe: (tasks: BuildTask[]) => EnvTransformer = this.react.overrideBuildPipe.bind(this.react);

  /**
   * override the build ts config.
   */
  overrideBuildTsConfig = this.react.overrideBuildTsConfig.bind(this.react);

  /**
   * override package json properties.
   */
  overridePackageJsonProps: (props: PackageJsonProps) => EnvTransformer = this.react.overridePackageJsonProps.bind(
    this.react
  );

  /**
   * override the preview config in the env.
   */
  overridePreviewConfig = this.react.overridePreviewConfig.bind(this.react);

  /**
   * override the dev server configuration.
   */
  overrideDevServerConfig = this.react.overrideDevServerConfig.bind(this.react);

  /**
   * override the dependency configuration of the component environment.
   */
  overrideDependencies(dependencyPolicy: VariantPolicyConfigObject) {
    return this.envs.override({
      getDependencies: () => merge(dependencyPolicy, this.reactNativeEnv.getDependencies()),
    });
  }

  /**
   * create a new composition of the node environment.
   */
  compose(transformers: EnvTransformer[], targetEnv: Environment = {}) {
    return this.envs.compose(this.envs.merge(targetEnv, this.reactNativeEnv), transformers);
  }

  // static runtime = MainRuntime;
  // static dependencies = [EnvsAspect, ReactAspect];

  // static async provider([envs, react]: [EnvsMain, ReactMain]) {
  //   const reactEnv: Environment = envs.merge(new NodeEnv(), react.reactEnv);
  //   envs.registerEnv(nodeEnv);
  //   return new NodeMain(react, nodeEnv, envs);
  // }
  static dependencies: Aspect[] = [ReactAspect, EnvsAspect];
  static runtime = MainRuntime;
  static async provider([react, envs]: [ReactMain, EnvsMain]) {
    const reactNativeEnv = react.compose([
      react.overrideDevServerConfig(webpackConfig),
      react.overridePreviewConfig(webpackConfig),
      // react.overrideJestConfig(jestConfig),
      react.overrideDependencies({
        dependencies: {
          react: '-',
          'react-native': '-',
        },
        devDependencies: {
          '@types/react-native': '^0.63.2',
          '@types/jest': '~26.0.9',
          react: '-',
          'react-native': '-',
          'react-native-web': '0.14.8',
        },
        peerDependencies: {
          react: '^16.13.1',
          'react-native': '^0.63.3',
        },
      }),
    ]);
    envs.registerEnv(reactNativeEnv);
    return new ReactNativeMain(react, reactNativeEnv, envs);
  }
}

ReactNativeAspect.addRuntime(ReactNativeMain);

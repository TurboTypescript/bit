import { JestAspect } from './jest.aspect';
import { MainRuntime } from '@teambit/cli';
import { JestTester } from './jest.tester';

export class JestMain {
  static runtime = MainRuntime;
  static dependencies = [];

  createTester(jestConfig: any) {
    return new JestTester(jestConfig);
  }

  static async provider() {
    return new JestMain();
  }
}

JestAspect.addRuntime(JestMain);